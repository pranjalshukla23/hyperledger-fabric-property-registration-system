'use strict';

const{Contract} = require("fabric-contract-api");

class RegistrarContract extends Contract{

    constructor() {
        //custom name for the contract
        super("org.property-registration-network.registrar");
    }

    async instantiate(ctx){

        console.log("Registrar contract deployed successfully");
    }
    async approveNewUser(ctx,name,aadhar){

        const requestKey=ctx.stub.createCompositeKey("org.property-registration-network.user.request",[name+"-"+aadhar]);

        const userAssetKey=ctx.stub.createCompositeKey("org.property-registration-network.registrar.asset",[name]);

        let userRequestAsset=await ctx.stub.getState(requestKey);

        if(userRequestAsset.length===0){

            throw new Error("No such user request in network");
        }

        let userAssetObject=JSON.parse(userRequestAsset.toString());

        userAssetObject.upgradCoins=0;

        let userAsset=Buffer.from(JSON.stringify(userAssetObject));

        await ctx.stub.putState(userAssetKey,userAsset);

        return JSON.parse(userAsset.toString());

    }

    async viewUser(ctx,name,aadhar){

        const userAssetKey = ctx.stub.createCompositeKey("org.property-registration-network.registrar.asset", [name]);

        let userAsset = await ctx.stub.getState(userAssetKey);

        if(userAsset.length===0){

            throw new Error("User is not registered in the network");
        }

        return JSON.parse(userAsset.toString());

    }

    async approvePropertyRegistration(ctx,propertyId){

        const propertyRequestKey=ctx.stub.createCompositeKey("org.proper-registration-network.user.propertyRequest", [propertyId]);

        const propertyAssetKey=ctx.stub.createCompositeKey("org.proper-registration-network.user.property", [propertyId]);

        let propertyRequest= await ctx.stub.getState(propertyRequestKey);

        if(propertyRequest.length===0){

            throw new Error("No such property with mentioned property ID exists.")
        }

        let propertyRequestObject=JSON.parse(propertyRequest.toString());


        let propertyAsset= Buffer.from(JSON.stringify(propertyRequestObject));

        await ctx.stub.putState(propertyAssetKey,propertyAsset);

        return JSON.parse(propertyAsset.toString());

    }

    async viewProperty(ctx,propertyId){

        const propertyAssetKey=ctx.stub.createCompositeKey("org.proper-registration-network.user.property", [propertyId]);

        let propertyAsset= await ctx.stub.getState(propertyAssetKey);

        if(propertyAsset.length===0){

            throw new Error("property with specified property ID does not exist");
        }

        return JSON.parse(propertyAsset.toString());
    }




}

module.exports=RegistrarContract;