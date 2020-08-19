/**
 * Helper for making selective update queries.
 *
 * The calling function can use it to make the SET clause of an SQL UPDATE
 * statement.
 *
 * WARNING: this does not do any security check on the dataToUpdate passed in:
 * the caller must ensure that these fields are ones that should be set via
 * validation prior to this function.
 *
 * @param dataToUpdate {Object} {field1: newVal, field2: newVal, ...}
 *
 * @returns {Object} {sqlSetCols, dataToUpdate}
 *
 * @example {name: 'Aliya', age: 32} =>
 *   { setCols: "name=$1, age=$2", values: ['Aliya', 32] }
 */

function sqlForPartialUpdate(dataToUpdate) {
  // {name: 'Aliya', age: 32} => ['name=$1', 'age=$2']
  const cols = Object.keys(dataToUpdate).map(
      (col, idx) => `${col}=$${idx + 1}`);

  return {
    setCols: cols.join(", "),
    values: Object.values(dataToUpdate),
  };
}

module.exports = { sqlForPartialUpdate };
