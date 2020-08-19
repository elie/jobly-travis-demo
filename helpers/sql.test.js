const { sqlForPartialUpdate } = require("./sql");


describe("sqlForPartialUpdate", function () {
  test("1 item", function () {
    const result = sqlForPartialUpdate({ field1: "val1" });
    expect(result).toEqual({ setCols: "field1=$1", values: ["val1"] });
  });

  test("2 items", function () {
    const result = sqlForPartialUpdate({
      field1: "val1",
      field2: "val2",
    });
    expect(result).toEqual({
      setCols: "field1=$1, field2=$2",
      values: ["val1", "val2"],
    });
  });
});
