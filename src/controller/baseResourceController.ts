import { Model } from 'mongoose';
import { Request, Response, NextFunction } from 'express';
import { extend, merge, mergeWith } from 'lodash';

interface Filter {
    field: string,
    value: string,
    regex: { flags: string }
}

interface Population {
    path?: string,
    populate?: Population[]
};

export class BaseResourceController {

    protected _model: Model<any>;

    constructor(model: Model<any>, subdocument: string[] = []) {
        // Generic types are really weird in typescript
        // and also they don't work in javascript
        // so a lot of the functionality simply doesn't work
        // <T extends mongoose.Model<any>>
        // Static methods from generic types can't be used
        // so extending the generic is almost useless IMHO
        this._model = model;

        this.filter = this.filter.bind(this);
        this.create = this.create.bind(this);
        this.get = this.get.bind(this);
        this.update = this.update.bind(this);
        this.delete = this.delete.bind(this);
    }

    async get(req: Request, res: Response, next: NextFunction) {
        let id = req.params._id || req.params.id;

        try {
            res.send(await this._model.findById(id).lean());
        } catch (e) {
            next(e);
            return;
        }

        next();
    }

    async filter(req: Request, res: Response, next: NextFunction) {
        try {
            if (req.body._id || req.body.id) {
                res.send(await this._model.findById(req.body._id || req.body.id));
                return;
            }
    
            let part: string[] = req.body.part;
            // let populate: any = req.body.populate;
            let filters: Filter[] = req.body.filters;
            let sortings: string[] = req.body.sortings;
            let limit: number = req.body.limit ? req.body.limit : 30;
            let page: number = req.body.page ? req.body.page : 0;
    
            let query = this._model.find();
    
            // if (populate) {  
            //     let formattedPopulation = this.populateRecursively(populate);
                
            //     formattedPopulation.forEach((popul: any) => {
            //         query.populate(popul);
            //     });
            // }
    
            if (filters) {
                let usedFilterFields: string[] = [];
                filters.forEach((filter) => {
                    if (!filter.field)
                        return;
                    if (!filter.value)
                        return;

                    let equals = !filter.field.startsWith('-');
                    let field = filter.field.substring(filter.field.startsWith('-') || filter.field.startsWith('+') ? 1 : 0);
                    let value: string | RegExp = filter.value;
                    
                    // Skip field if it is in guarded array or it was already added
                    // @ts-ignore
                    if (this._model.unqueryablePaths().includes(field) || usedFilterFields.includes(field))
                        return;
        
                    query.where(field);
                    
                    if (filter.regex)
                        value = new RegExp(value, filter.regex.flags);
    
                    if (equals)
                        query.equals(value);
                    else
                        query.ne(value);
    
                    usedFilterFields.push(field);
                });
            }
    
            if (sortings) {
                sortings.forEach((sorting) => {
                    let field = sorting.substring(sorting.startsWith('-') || sorting.startsWith('+') ? 1 : 0);
    
                    // @ts-ignore
                    if (this._model.unqueryablePaths().includes(field))
                        return;
    
                    // Example
                    // sort by "field" ascending and "test" descending
                    // query.sort('field -test');
                    query.sort(sorting);
                });
            }
            
            if (part) {
                query.select(part);
    
                // @ts-ignore
                query.select(this._model.unqueryablePaths().map((field) => "-" + field));
            }
    
            query.limit(limit);
            query.skip(page * limit);
            
            res.send(await query.exec());
        } catch (e) {
            next(e);
            return;
        }

        next();
    }

    create(req: Request, res: Response, next: NextFunction): void {
        this._model.validate(req.body).then(async () => {
            let object = new this._model(req.body);
            
            try {
                await object.save();
    
                res.locals.createdObject = object;

                res.status(201).send();
            } catch (e) {
                next(e);
                return;
            }

            next();
        }, (err: any) => next(err));
    }
    
    async update(req: Request, res: Response, next: NextFunction) {
        try {
            let originalObject;
            if (res.locals.documentToUpdate)
                originalObject = res.locals.documentToUpdate;
            else
                originalObject = await this._model.findById(req.params.id || req.params._id);

            let updatedObject = extend(originalObject, req.body);
                    
            await updatedObject.save();

            res.status(204).send();
        } catch (err) {
            next(err);
            return;
        }

        next();
    }

    async delete(req: Request, res: Response, next: NextFunction) {
        try {
            await this._model.deleteOne({ _id: req.params.id || req.params._id });

            res.status(204).send();
        } catch (err) {
            next(err);
            return;
        }

        next();
    }

    /**
     * Deep iteration through the keys of an object to create a valid object that can be passed to populate
     * @param populate An object with the following structe: { modelToPopulate: {  } }
     * @returns A valid object that can be passed to a mongoose model populate
     */
    private populateRecursively(populate: any): any {
        let result: Population[] = [];

        for (const key in populate) {
            // Select will be reserved for the paths you wanna select in the populate
            if (populate.hasOwnProperty(key) && key != 'select') {
                const element = populate[key];
                let object: any = { path: key, populate: this.populateRecursively(element) };

                if (element.hasOwnProperty('select'))
                    object.select = element.select;

                result.push(object);
            }
        }

        return result;
    }
}