'use strict';
const db = require('@arangodb').db;
const collections = [
  "Taxonomy",
  "Nodes",
  "Node_Types",
  "Fields",
  "Taxonomy_Contains",
  "Edges",
  "Has_Field"
];

for (const localName of collections) {
  const qualifiedName = module.context.collectionName(localName);
  db._drop(qualifiedName);
}
