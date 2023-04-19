import Table from "../../models/tableModel.js";
import CallWaiter from "../../models/callWaiterModel.js";

// Get Tables
async function GetTables(req, res) {
  try {
    const { tenant_id } = req.params;

    const checkTable = await Table.aggregate([
      { $match: { tenant_id: tenant_id } },
      { $unwind: "$table" },
      { $sort: { "table.index": 1 } },
      {
        $project: {
          _id: 0,
          table: 1,
        },
      },
    ]);

    if (checkTable) {
      return res.status(200).json({
        status: "SUCCESS",
        message: "Table has been retrieved",
        data: checkTable,
      });
    } else {
      return res.status(404).json({
        status: "FAILED",
        message: "Table has not been retrieved",
      });
    }
  } catch (error) {
    res.status(500).json({
      status: "FAILED",
      message: error.message,
    });
  }
}

// Create Table
async function CreateTables(req, res) {
  try {
    const { tenant_id } = req.params;

    let table_id;
    const generateID = () => Math.floor(Math.random() * 9999);
    let tempId = generateID();

    const existingId = await Table.findOne({ "table.id": "Table-" + tempId });
    if (existingId) {
      tempId = new generateID();
      return tempId;
    }

    table_id = "Table-" + tempId;

    const existingTenant = await Table.findOne({
      tenant_id: tenant_id,
    });

    if (!existingTenant) {
      const newTable = new Table({
        tenant_id: tenant_id,
        table: [
          {
            id: table_id,
            index: 1,
            status: "EMPTY",
          },
        ],
      });
      await newTable.save();

      if (newTable) {
        const RetrieveLatestTable = await Table.aggregate([
          { $match: { tenant_id: tenant_id } },
          { $unwind: "$table" },
          { $sort: { "table.index": 1 } },
          {
            $project: {
              _id: 0,
              table: 1,
            },
          },
        ]);

        return res.status(200).json({
          status: "SUCCESS",
          message: "New Table has been created",
          data: RetrieveLatestTable,
        });
      } else {
        return res.status(404).json({
          status: "FAILED",
          message: "New Table failed to be created",
        });
      }
    }

    const amount = await Table.aggregate([
      { $match: { tenant_id: tenant_id } },
      {
        $project: {
          _id: 0,
          count: { $size: "$table" },
        },
      },
    ]);

    if (existingTenant) {

      if (amount[0].count == 0) {
        await Table.updateOne(
          {
            tenant_id: tenant_id,
          },
          {
            $push: {
              table: {
                id: table_id,
                index: 1,
              },
            },
          }
        );

        const RetrieveLatestTable = await Table.aggregate([
          { $match: { tenant_id: tenant_id } },
          { $unwind: "$table" },
          { $sort: { "table.index": 1 } },
          {
            $project: {
              _id: 0,
              table: 1,
            },
          },
        ]);

        if (RetrieveLatestTable) {
          return res.status(200).json({
            status: "SUCCESS",
            message: "Table has been created",
            data: RetrieveLatestTable,
          });
        } else {
          return res.status(404).json({
            status: "FAILED",
            message: "Table has not been created",
          });
        }
      }

      for (let j = 1; j <= amount[0].count; j++) {
        let notExistingIndex = await Table.findOne({
          $and: [{ tenant_id: tenant_id }, { "table.index": { $ne: j } }],
        });

        while (notExistingIndex != null) {
          await Table.updateOne(
            {
              tenant_id: tenant_id,
            },
            {
              $push: {
                table: {
                  id: table_id,
                  index: j,
                },
              },
            }
          );
          const RetrieveLatestTable = await Table.aggregate([
            { $match: { tenant_id: tenant_id } },
            { $unwind: "$table" },
            { $sort: { "table.index": 1 } },
            {
              $project: {
                _id: 0,
                table: 1,
              },
            },
          ]);

          if (RetrieveLatestTable) {
            return res.status(200).json({
              status: "SUCCESS",
              message: "Table has been created",
              data: RetrieveLatestTable,
            });
          } else {
            return res.status(404).json({
              status: "FAILED",
              message: "Table has not been created",
            });
          }
        }
        if (j == amount[0].count) {
          await Table.updateOne(
            {
              tenant_id: tenant_id,
            },
            {
              $push: {
                table: {
                  id: table_id,
                  index: amount[0].count + 1,
                },
              },
            }
          );

          const RetrieveLatestTable = await Table.aggregate([
            { $match: { tenant_id: tenant_id } },
            { $unwind: "$table" },
            { $sort: { "table.index": 1 } },
            {
              $project: {
                _id: 0,
                table: 1,
              },
            },
          ]);

          if (RetrieveLatestTable) {
            return res.status(200).json({
              status: "SUCCESS",
              message: "Table has been retrieved",
              data: RetrieveLatestTable,
            });
          } else {
            return res.status(404).json({
              status: "FAILED",
              message: "Table has not been retrieved",
            });
          }
        }
      }
    } else {
      return res.status(404).json({
        status: "FAILED",
        message: "Category exists",
      });
    }
  } catch (error) {
    res.status(500).json({
      status: "FAILED",
      message: error.message,
    });
  }
}

// Duplicate Table Content
async function DuplicateTables(req, res) {
  try {
    const { tenant_id } = req.params;
    const { or_table, de_table } = req.body;

    const checkTable = await Table.findOne({
      $and: [{ tenant_id: tenant_id }, { "table.id": or_table }],
    });

    if (checkTable) {
      const currentIndex = await Table.findOne(
        {
          "table.id": or_table,
        },
        {
          table: { $elemMatch: { id: or_table } },
        }
      );

      const ingoingIndex = await Table.findOne(
        {
          "table.id": de_table,
        },
        {
          table: { $elemMatch: { id: de_table } },
        }
      );

      // Swapping Sequence
      await Table.updateOne(
        {
          "table.id": currentIndex.table[0].id,
        },
        {
          $set: {
            "table.$[out].status": ingoingIndex.table[0].status,
            "table.$[out].isWaiterCalled": ingoingIndex.table[0].isWaiterCalled,
            "table.$[out].timeStart": ingoingIndex.table[0].timeStart,
            "table.$[out].customerCount": ingoingIndex.table[0].customerCount,
            "table.$[out].order_id": ingoingIndex.table[0].order_id,

            "table.$[in].status": currentIndex.table[0].status,
            "table.$[in].isWaiterCalled": currentIndex.table[0].isWaiterCalled,
            "table.$[in].timeStart": currentIndex.table[0].timeStart,
            "table.$[in].customerCount": currentIndex.table[0].customerCount,
            "table.$[in].order_id": currentIndex.table[0].order_id,
          },
        },
        {
          arrayFilters: [{ "out.id": or_table }, { "in.id": de_table }],
        }
      );

      const RetrieveLatestTable = await Table.aggregate([
        { $match: { tenant_id: tenant_id } },
        { $unwind: "$table" },
        { $sort: { "table.index": 1 } },
        {
          $project: {
            _id: 0,
            table: 1,
          },
        },
      ]);

      return res.status(200).json({
        status: "SUCCESS",
        message: "Table has been updated",
        data: RetrieveLatestTable,
      });
    } else {
      return res.status(404).json({
        status: "FAILED",
        message: "Table has not been retrieved",
      });
    }
  } catch (error) {
    res.status(500).json({
      status: "FAILED",
      message: error.message,
    });
  }
}

// Remove Table Content
async function RemoveTableContent(req, res) {
  try {
    const { tenant_id } = req.params;
    const { table_id } = req.body;

    const checkTable = await Table.findOne(
      {
        tenant_id: tenant_id,
      },
      { table: { $elemMatch: { id: table_id } } }
    );

    if (checkTable) {
      const deleteTable = await Table.updateOne(
        {
          "table.id": table_id,
        },
        {
          $set: {
            "table.$.status": "EMPTY",
            "table.$.isWaiterCalled": false,
            "table.$.timeStart": new Date("2022-01-01"),
            "table.$.customerCount": 0,
            "table.$.order_id": "NULL",
          },
        }
      );

      if (deleteTable) {
        const existingTenant = await CallWaiter.findOne(
          {
            tenant_id: tenant_id,
          },
          { waiter: { $elemMatch: { order_table: table_id } } }
        );

        if (existingTenant) {
          const deleteWaiter = await CallWaiter.updateOne(
            {
              tenant_id: tenant_id,
            },
            {
              $pull: {
                waiter: { order_table: table_id },
              },
            }
          );

          if (deleteWaiter) {
            const RetrieveLatestTable = await Table.aggregate([
              { $match: { tenant_id: tenant_id } },
              { $unwind: "$table" },
              { $sort: { "table.index": 1 } },
              {
                $project: {
                  _id: 0,
                  table: 1,
                },
              },
            ]);

            return res.status(200).json({
              status: "SUCCESS",
              message: "Table content has been deleted",
              data: RetrieveLatestTable,
            });
          }
        }
      }
    } else {
      return res.status(404).json({
        status: "FAILED",
        message: "Table content has not been deleted",
      });
    }
  } catch (error) {
    res.status(500).json({
      status: "FAILED",
      message: error.message,
    });
  }
}

// Remove Table
async function RemoveTable(req, res) {
  try {
    const { tenant_id } = req.params;
    const { table_id } = req.body;

    const checkTable = await Table.findOne(
      {
        tenant_id: tenant_id,
      },
      { table: { $elemMatch: { id: table_id } } }
    );

    if (checkTable) {
      const deleteTable = await Table.updateOne(
        {
          "table.id": table_id,
        },
        {
          $pull: {
            table: { id: table_id },
          },
        }
      );

      if (deleteTable) {
        const RetrieveLatestTable = await Table.aggregate([
          { $match: { tenant_id: tenant_id } },
          { $unwind: "$table" },
          { $sort: { "table.index": 1 } },
          {
            $project: {
              _id: 0,
              table: 1,
            },
          },
        ]);

        return res.status(200).json({
          status: "SUCCESS",
          message: "Table has been deleted",
          data: RetrieveLatestTable,
        });
      }
    } else {
      return res.status(404).json({
        status: "FAILED",
        message: "Table has not been deleted",
      });
    }
  } catch (error) {
    res.status(500).json({
      status: "FAILED",
      message: error.message,
    });
  }
}

export {
  CreateTables,
  GetTables,
  DuplicateTables,
  RemoveTable,
  RemoveTableContent,
};
