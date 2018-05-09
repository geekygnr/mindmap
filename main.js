'use strict';

module.context.use('/taxonomy', require('./routes/taxonomy'), 'taxonomy');
module.context.use('/nodes', require('./routes/nodes'), 'nodes');
module.context.use('/node_types', require('./routes/node_types'), 'node_types');
module.context.use('/fields', require('./routes/fields'), 'fields');
module.context.use('/taxonomy_contains', require('./routes/taxonomy_contains'), 'taxonomy_contains');
module.context.use('/edges', require('./routes/edges'), 'edges');
module.context.use('/has_field', require('./routes/has_field'), 'has_field');
