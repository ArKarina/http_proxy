import express, { json } from 'express';
import axios from 'axios';
import { Database } from './db.js';
export const app = express();

app.use(express.json());

app.get('/requests', async (req, res) => {
    try {
        const answer = await Database.getAllInfo();
        res.json(answer);
    } catch (e) {
        res.json(e);
    }
})

app.get('/request/:id', async (req, res) => {
    try {
        const answer = await Database.getInfoById(req.params.id);
        res.json(answer);
    } catch (e) {
        res.json(e);
    }
})

app.get('/repeat/:id', async (req, res) => {
    try {
        const answer = await Database.getInfoById(req.params.id);
        const path = answer.request.isSecure ? answer.request.path :
            '/' + answer.request.path.split('/').slice(1).join('/');
        let url = answer.request.isSecure ? 'https://' + `${answer.request.host}${path}` :
            'http://' + `${answer.request.host}${path}`;
        const getParams = answer.request.get_params == '' ? {} : JSON.parse(answer.request.get_params);
        if (Object.keys(getParams).length > 0) {
            url += '?';
            for (let key in getParams) {
                url += `${key}=${getParams[key]}&`;
            }
        }
        axios({
            url: url,
            method: answer.request.method,
            headers: JSON.parse(answer.request.headers),
            data: (answer.request.method !== 'GET' && answer.request.method !== 'HEAD') ? 
                answer.request.post_params : undefined,
            withCredentials: true, //
            maxRedirects: 0,
            validateStatus: function (status) {
                return status >= 200 && status < 500;
              }
        }).then((resp) => {
            res.json({status: resp.status, statusText: resp.statusText, data: resp.data});
        });
    } catch (e) {
        res.json(e);
    }
})
