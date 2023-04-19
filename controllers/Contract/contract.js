import Contract from "../../models/contractModel.js";
import Tenant from "../../models/tenantModel.js";

async function CreateContract(req, res) {
  try {
    const { tenant_id } = req.params;
    const { start_Date, contract_Period, contract_Name, contract_File } =
      req.body;

    // Find Tenant
    const checkContract = await Contract.findOne({ tenant_id });

    if (!checkContract) {
      const newContract = new Contract({
        tenant_id: tenant_id,
        start_Date: start_Date,
        contract_Period: contract_Period,
        contract_File: contract_File,
      });
      await newContract.save();

      // Update contract in Tenant
      const checkTenant = await Tenant.findOne({ tenant_id });
      if (checkTenant) {
        checkTenant.contract_Name = contract_Name;
      }
      await checkTenant.save();

      return res.status(200).json({
        status: "SUCCESS",
        message: "Contract has been created",
        data: checkContract,
      });
    } else if (checkContract) {
      (checkContract.start_Date = start_Date),
        (checkContract.contract_Period = contract_Period),
        (checkContract.contract_File = contract_File),
        await checkContract.save();

      // Update contract in Tenant
      const checkTenant = await Tenant.findOne({ tenant_id });
      if (checkTenant) {
        checkTenant.contract_Name = contract_Name;
      }
      await checkTenant.save();

      return res.status(200).json({
        status: "SUCCESS",
        message: "Profile has been edited",
        data: checkTenant,
      });
    } 
    else {
      return res.status(404).json({
        status: "FAILED",
        message: "Contract is not found",
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: "FAILED",
      message: error.message,
    });
  }
}

async function GetContractDetails(req, res) {
  try {
    const { tenant_id } = req.params;

    // Find Contract
    const checkContract = await Contract.findOne({ tenant_id });

    if (checkContract) {
      return res.status(200).json({
        status: "SUCCESS",
        message: "Contract has been found",
        data: checkContract,
      });
    } else {
      return res.status(404).json({
        status: "FAILED",
        message: "Contract is not found",
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: "FAILED",
      message: error.message,
    });
  }
}

async function EditContract(req, res) {
  try {
    const { tenant_id } = req.params;
    const { start_Date, contract_Period, contract_Name, contract_File } =
      req.body;

    // Find Tenant
    const checkContract = await Contract.findOne({ tenant_id });

    if (checkContract) {
      const updateContract = await Contract.updateOne(
        {
          tenant_id: tenant_id,
        },
        {
          $set: {
            start_Date: start_Date,
            contract_Period: contract_Period,
            contract_File: contract_File,
          },
        }
      );

      // Update contract in Tenant
      const checkTenant = await Tenant.findOne({ tenant_id });
      if (checkTenant) {
        checkTenant.contract_Name = contract_Name;
      }
      await checkTenant.save();

      if (updateContract) {
        const checkAfterUpdate = await Contract.findOne({
          tenant_id: tenant_id,
        });

        return res.status(200).json({
          status: "SUCCESS",
          message: "Contract has been updated",
          data: checkAfterUpdate,
        });
      } else {
        return res.status(404).json({
          status: "FAILED",
          message: "Contract failed to be updated",
        });
      }
    } else {
      return res.status(404).json({
        status: "FAILED",
        message: "Contract is not found",
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: "FAILED",
      message: error.message,
    });
  }
}

async function RemoveContract(req, res) {
  try {
    const { tenant_id } = req.params;

    // Find Tenant
    const checkContract = await Contract.findOne({ tenant_id });

    if (checkContract) {
      const deleteContract = await Contract.updateOne(
        {
          tenant_id: tenant_id,
        },
        {
          $unset: {
            tenant_id: tenant_id,
          },
        }
      );

      // Update contract in Tenant
      const checkTenant = await Tenant.findOne({ tenant_id });
      if (checkTenant) {
        checkTenant.contract_Name = "please add contract";
      }
      await checkTenant.save();

      if (deleteContract) {
        return res.status(200).json({
          status: "SUCCESS",
          message: "Contract has been deleted",
        });
      } else {
        return res.status(404).json({
          status: "FAILED",
          message: "Contract failed to be deleted",
        });
      }
    } else {
      return res.status(404).json({
        status: "FAILED",
        message: "Contract is not found",
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: "FAILED",
      message: error.message,
    });
  }
}

export { CreateContract, GetContractDetails, EditContract, RemoveContract };
