'use strict';
const Joi = require('joi');
const Boom = require('boom')
const { dataExists } = require('../lib/helpers');
const admin = require('firebase-admin');
const shortid = require('shortid');
const _ = require('lodash');
const moment = require('moment');
const ref = admin.database().ref('/posts');

const internals = {
    schemas: {}
};

internals.schemas.postSchema = Joi.object().keys({
    title: Joi.string().required(),
    author: Joi.string().required(),
    textBody: Joi.string().required(),
    date: Joi.date()
});

internals.schemas.updatePostSchema = Joi.object().keys({
    title: Joi.string().optional(),
    author: Joi.string().optional(),
    textBody: Joi.string().optional(),
    date: Joi.date()
});

exports.createPost = async function(req) {
    const postId = shortid.generate();
    await Joi.validate(req, internals.schemas.postSchema).catch(err => {
        throw Boom.badRequest(err);
    });

    const dataToPost = _.pick(req, ['title', 'author', 'textBody']);

    _.extend(dataToPost, {
        id: postId,
        date: moment().toISOString()
    });

    await ref.child(postId).set(dataToPost);
    return dataToPost;
};

exports.getPosts = async function() {
    return await ref.once('value');
};

exports.getPostById = async function(id) {
    const exists = await dataExists(id, ref);

    if (!exists) {
        throw Boom.badRequest(`Could not find Post with ID: ${id}`);
    }

    const snapshot = await ref.child(id).once('value');
    return snapshot.val();
};

exports.updatePost = async function(req, id) { 
    await Joi.validate(req, internals.schemas.updatePostSchema).catch(() => {
        throw Boom.badRequest('Request poorly formed.');
    });

    const exists = await dataExists(id, ref);

    if (!exists) {
        throw Boom.badRequest(`Could not find Post with ID: ${id}`);
    }

    await ref.child(id).update(req);
    const snapshot = await ref.child(id).once('value');
    return snapshot.val();
};

exports.deletePost = async function(id) {
    const exists = await dataExists(id, ref);

    if (!exists) {
        throw Boom.badRequest(`Could not find Post with ID: ${id}`);
    }

    await ref.child(id).remove();
    return { message: `Post ${id}, has been deleted.` };
};

        