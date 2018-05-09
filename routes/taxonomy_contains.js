'use strict';
const dd = require('dedent');
const joi = require('joi');
const httpError = require('http-errors');
const status = require('statuses');
const errors = require('@arangodb').errors;
const createRouter = require('@arangodb/foxx/router');
const Taxonomy_Contain = require('../models/taxonomy_contain');

const Taxonomy_Contains = module.context.collection('Taxonomy_Contains');
const keySchema = joi.string().required()
.description('The key of the taxonomy_Contain');

const ARANGO_NOT_FOUND = errors.ERROR_ARANGO_DOCUMENT_NOT_FOUND.code;
const ARANGO_DUPLICATE = errors.ERROR_ARANGO_UNIQUE_CONSTRAINT_VIOLATED.code;
const ARANGO_CONFLICT = errors.ERROR_ARANGO_CONFLICT.code;
const HTTP_NOT_FOUND = status('not found');
const HTTP_CONFLICT = status('conflict');

const router = createRouter();
module.exports = router;


router.tag('taxonomy_Contain');


const NewTaxonomy_Contain = Object.assign({}, Taxonomy_Contain, {
  schema: Object.assign({}, Taxonomy_Contain.schema, {
    _from: joi.string(),
    _to: joi.string()
  })
});


router.get(function (req, res) {
  res.send(Taxonomy_Contains.all());
}, 'list')
.response([Taxonomy_Contain], 'A list of Taxonomy_Contains.')
.summary('List all Taxonomy_Contains')
.description(dd`
  Retrieves a list of all Taxonomy_Contains.
`);


router.post(function (req, res) {
  const taxonomy_Contain = req.body;
  let meta;
  try {
    meta = Taxonomy_Contains.save(taxonomy_Contain._from, taxonomy_Contain._to, taxonomy_Contain);
  } catch (e) {
    if (e.isArangoError && e.errorNum === ARANGO_DUPLICATE) {
      throw httpError(HTTP_CONFLICT, e.message);
    }
    throw e;
  }
  Object.assign(taxonomy_Contain, meta);
  res.status(201);
  res.set('location', req.makeAbsolute(
    req.reverse('detail', {key: taxonomy_Contain._key})
  ));
  res.send(taxonomy_Contain);
}, 'create')
.body(NewTaxonomy_Contain, 'The taxonomy_Contain to create.')
.response(201, Taxonomy_Contain, 'The created taxonomy_Contain.')
.error(HTTP_CONFLICT, 'The taxonomy_Contain already exists.')
.summary('Create a new taxonomy_Contain')
.description(dd`
  Creates a new taxonomy_Contain from the request body and
  returns the saved document.
`);


router.get(':key', function (req, res) {
  const key = req.pathParams.key;
  let taxonomy_Contain
  try {
    taxonomy_Contain = Taxonomy_Contains.document(key);
  } catch (e) {
    if (e.isArangoError && e.errorNum === ARANGO_NOT_FOUND) {
      throw httpError(HTTP_NOT_FOUND, e.message);
    }
    throw e;
  }
  res.send(taxonomy_Contain);
}, 'detail')
.pathParam('key', keySchema)
.response(Taxonomy_Contain, 'The taxonomy_Contain.')
.summary('Fetch a taxonomy_Contain')
.description(dd`
  Retrieves a taxonomy_Contain by its key.
`);


router.put(':key', function (req, res) {
  const key = req.pathParams.key;
  const taxonomy_Contain = req.body;
  let meta;
  try {
    meta = Taxonomy_Contains.replace(key, taxonomy_Contain);
  } catch (e) {
    if (e.isArangoError && e.errorNum === ARANGO_NOT_FOUND) {
      throw httpError(HTTP_NOT_FOUND, e.message);
    }
    if (e.isArangoError && e.errorNum === ARANGO_CONFLICT) {
      throw httpError(HTTP_CONFLICT, e.message);
    }
    throw e;
  }
  Object.assign(taxonomy_Contain, meta);
  res.send(taxonomy_Contain);
}, 'replace')
.pathParam('key', keySchema)
.body(Taxonomy_Contain, 'The data to replace the taxonomy_Contain with.')
.response(Taxonomy_Contain, 'The new taxonomy_Contain.')
.summary('Replace a taxonomy_Contain')
.description(dd`
  Replaces an existing taxonomy_Contain with the request body and
  returns the new document.
`);


router.patch(':key', function (req, res) {
  const key = req.pathParams.key;
  const patchData = req.body;
  let taxonomy_Contain;
  try {
    Taxonomy_Contains.update(key, patchData);
    taxonomy_Contain = Taxonomy_Contains.document(key);
  } catch (e) {
    if (e.isArangoError && e.errorNum === ARANGO_NOT_FOUND) {
      throw httpError(HTTP_NOT_FOUND, e.message);
    }
    if (e.isArangoError && e.errorNum === ARANGO_CONFLICT) {
      throw httpError(HTTP_CONFLICT, e.message);
    }
    throw e;
  }
  res.send(taxonomy_Contain);
}, 'update')
.pathParam('key', keySchema)
.body(joi.object().description('The data to update the taxonomy_Contain with.'))
.response(Taxonomy_Contain, 'The updated taxonomy_Contain.')
.summary('Update a taxonomy_Contain')
.description(dd`
  Patches a taxonomy_Contain with the request body and
  returns the updated document.
`);


router.delete(':key', function (req, res) {
  const key = req.pathParams.key;
  try {
    Taxonomy_Contains.remove(key);
  } catch (e) {
    if (e.isArangoError && e.errorNum === ARANGO_NOT_FOUND) {
      throw httpError(HTTP_NOT_FOUND, e.message);
    }
    throw e;
  }
}, 'delete')
.pathParam('key', keySchema)
.response(null)
.summary('Remove a taxonomy_Contain')
.description(dd`
  Deletes a taxonomy_Contain from the database.
`);
