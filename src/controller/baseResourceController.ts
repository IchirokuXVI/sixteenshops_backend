import { Model } from 'mongoose';
import { Request, Response, NextFunction } from 'express';

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

    constructor(model: Model<any>) {
        // Generic types are really weird in typescript
        // and also they don't work in javascript
        // so a lot of the functionality simply doesn't work
        // <T extends mongoose.Model<any>>
        // Static methods from generic types can't be used
        // so extending the generic is almost useless IMHO
        this._model = model;

        this.filter = this.filter.bind(this);
        this.create = this.create.bind(this);
    }

    async get(req: Request, res: Response) {
        let limit: number = req.body.limit ? req.body.limit : 30;
        let page: number = req.body.page ? req.body.page : 0;

        return req.query._id ? this._model.findById(req.query._id) : this._model.find().limit(limit).skip(page * limit).exec();
    }

    async filter(req: Request, res: Response, next: NextFunction) {
        try {
            if (req.body._id) {
                res.send(await this._model.findById(req.body._id));
                return;
            }
    
            let part: string[] = req.body.part;
            let populate: any = req.body.populate;
            let filters: Filter[] = req.body.filters;
            let sortings: string[] = req.body.sortings;
            let limit: number = req.body.limit ? req.body.limit : 30;
            let page: number = req.body.page ? req.body.page : 0;
    
            let query = this._model.find();
    
            if (populate) {
                console.log(populate);
    
                let formattedPopulation = this.populateRecursively(populate);
                
                formattedPopulation.forEach((popul: any) => {
                    query.populate(popul);
                });
            }
    
            if (filters) {
                let usedFilterFields: string[] = [];
                filters.forEach((filter) => {
                    let equals = !filter.field.startsWith('-');
                    let field = filter.field.substring(filter.field.startsWith('-') || filter.field.startsWith('+') ? 1 : 0);
                    let value: string | RegExp = filter.value;
                    
                    // Skip field if it is in guarded array or it was already added
                    // @ts-ignore
                    if (this._model.guardedPaths().includes(field) || usedFilterFields.includes(field))
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
                    if (this._model.guardedPaths().includes(field))
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
                query.select(this._model.guardedPaths().map((field) => "-" + field));
            }
    
            query.limit(limit);
            query.skip(page * limit);
            
            res.send(await query.exec());
        } catch (e) {
            next(e);
        }
    }

    create(req: Request, res: Response, next: NextFunction): void {
        this._model.validate(req.body).then(() => {
            let object = new this._model(req.body);
            
            object.save((err: any) => {
                if (err)
                    next(err);
                else
                    res.status(201).send();
            });
        }, (err) => next(err));
    }
    
    private populateRecursively(populate: any): any {
        let result: Population[] = [];

        for (const key in populate) {
            if (populate.hasOwnProperty(key)) {
                const element = populate[key];
                result.push({ path: key, populate: this.populateRecursively(element) });
            }
        }

        return result;
    }
}