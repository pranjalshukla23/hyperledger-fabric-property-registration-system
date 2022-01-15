'use strict';

const{Contract} = require("fabric-contract-api");

class UserContract extends Contract {

    constructor() {
        //providing a custom name for contract
        super("org.property-registration-network.user");
    }

    //instantiation function
    async instantiate(ctx) {

        console.log("user contract deployed successfully");
    }

    async requestNewUser(ctx, name, aadhar, email, phone) {

        const requestKey = ctx.stub.createCompositeKey("org.property-registration-network.user.request", [name + "-" + aadhar]);

        let request = {
            name: name,
            aadhar: aadhar,
            email: email,
            phone: phone,
            createdAt: new Date()
        }
        let requestBuffer = Buffer.from(JSON.stringify(request));

        await ctx.stub.putState(requestKey, requestBuffer);

        return JSON.parse(requestBuffer.toString());
    }

    async rechargeAccount(ctx, name, aadhar, transactionId) {

        if (transactionId !== "upg100" && transactionId !== "upg500" && transactionId !== "upg1000") {

            throw new Error("Invalid Bank Transaction Id");
        }

        const assetKey = ctx.stub.createCompositeKey("org.property-registration-network.registrar.asset", [name]);

        let userAsset = await ctx.stub.getState(assetKey);

        if(userAsset.length===0){

            throw new Error("User is not registered on the network");
        }

        let userObject = JSON.parse(userAsset.toString());

        let previousBalance = userObject.upgradCoins;

        if (transactionId === "upg100") {

            userObject.upgradCoins = previousBalance + 100;
            userAsset = Buffer.from(JSON.stringify(userObject));
            await ctx.stub.putState(assetKey, userAsset);
            return JSON.parse(userAsset.toString());

        } else if (transactionId === "upg500") {

            userObject.upgradCoins = previousBalance + 500;
            userAsset = Buffer.from(JSON.stringify(userObject));
            await ctx.stub.putState(assetKey, userAsset);
            return JSON.parse(userAsset.toString());

        } else if (transactionId === "upg1000") {

            userObject.upgradCoins = previousBalance + 1000;
            userAsset = Buffer.from(JSON.stringify(userObject));
            await ctx.stub.putState(assetKey, userAsset);
            return JSON.parse(userAsset.toString());

        }

    }

    async viewUser(ctx,name,aadhar){

        const assetKey = ctx.stub.createCompositeKey("org.property-registration-network.registrar.asset", [name]);

        let userAsset = await ctx.stub.getState(assetKey);

        if(userAsset.length===0){

            throw new Error("User is not registered on the network");
        }

        return JSON.parse(userAsset.toString());

    }

    async propertyRegistrationRequest(ctx,name,aadhar,propertyId,price,status){

        const assetKey=ctx.stub.createCompositeKey("org.property-registration-network.registrar.asset",[name]);

        const propertyRequestKey=ctx.stub.createCompositeKey("org.proper-registration-network.user.propertyRequest", [propertyId]);

        let userAsset= await ctx.stub.getState(assetKey);

        if(userAsset.length===0){

            throw new Error("User Details are invalid. User may have not registered in the network");
        }

        let propertyObjectRequest={
            propertyId:propertyId,
            owner:name,
            price:price,
            status:status,

        }


            let propertyAssetRequest=Buffer.from(JSON.stringify(propertyObjectRequest));

            await ctx.stub.putState(propertyRequestKey,propertyAssetRequest);


            return JSON.parse(propertyAssetRequest.toString());

    }

    async viewProperty(ctx,propertyId){

        const propertyAssetKey=ctx.stub.createCompositeKey("org.proper-registration-network.user.property", [propertyId]);

        let propertyAsset= await ctx.stub.getState(propertyAssetKey);

        if(propertyAsset.length===0){

            throw new Error("Property with specified property ID does not exist")
        }

        return JSON.parse(propertyAsset.toString());
    }

    async updateProperty(ctx,propertyId,name,aadhar,status){

        const propertyAssetKey=ctx.stub.createCompositeKey("org.proper-registration-network.user.property", [propertyId]);

        const assetKey = ctx.stub.createCompositeKey("org.property-registration-network.registrar.asset", [name]);

        let userAsset = await ctx.stub.getState(assetKey);

        if(userAsset.length===0){

            throw new Error("User is not registered on the network");
        }

        let propertyAsset= await ctx.stub.getState(propertyAssetKey);

        if(propertyAsset.length===0){

            throw new Error("Property with mentioned property ID does not exist");
        }

        let propertyAssetObject=JSON.parse(propertyAsset.toString());

        if(propertyAssetObject.owner===name){

           propertyAssetObject.status=status;

           propertyAsset=Buffer.from(JSON.stringify(propertyAssetObject));

           await ctx.stub.putState(propertyAssetKey,propertyAsset);

           return JSON.parse(propertyAsset.toString());
        }else{

            throw new Error("You are not the owner of the property");
        }

    }

   async purchaseProperty(ctx,propertyId,name,aadhar) {

       const propertyAssetKey = ctx.stub.createCompositeKey("org.proper-registration-network.user.property", [propertyId]);

       let propertyAsset = await ctx.stub.getState(propertyAssetKey);

       const buyerAssetKey = ctx.stub.createCompositeKey("org.property-registration-network.registrar.asset", [name]);

       //buyer details
       let buyerAsset = await ctx.stub.getState(buyerAssetKey);

       if (propertyAsset.length === 0) {

           throw new Error("Property with mentioned property ID does not exist");
       }
       if (buyerAsset.length === 0) {

           throw new Error("User with mentioned name and aadhar is not registered in the network");


       }

       let propertyAssetObject = JSON.parse(propertyAsset.toString());
       let buyerAssetObject = JSON.parse(buyerAsset.toString());

       let presentOwner = propertyAssetObject.owner;

       //seller details
       const ownerAssetKey = ctx.stub.createCompositeKey("org.property-registration-network.registrar.asset", [presentOwner]);

       let ownerAsset = await ctx.stub.getState(ownerAssetKey);

       if(ownerAsset.length===0){

           throw new Error("Owner is not registered in the network");
       }

       let ownerAssetObject = JSON.parse(ownerAsset.toString());


       if (propertyAssetObject.status !== "onSale") {

           throw new Error("Property is not for sale");

       }

       if (buyerAssetObject.upgradCoins < propertyAssetObject.price) {

           throw new Error("You don't have sufficient balance to buy this property");
       }

       propertyAssetObject.owner = name;
       propertyAssetObject.status = "registered";

       propertyAsset = Buffer.from(JSON.stringify(propertyAssetObject));

       await ctx.stub.putState(propertyAssetKey, propertyAsset);

       buyerAssetObject.upgradCoins = buyerAssetObject.upgradCoins - propertyAssetObject.price;

       buyerAsset = Buffer.from(JSON.stringify(buyerAssetObject));

       await ctx.stub.putState(buyerAssetKey, buyerAsset);

       ownerAssetObject.upgradCoins = ownerAssetObject.upgradCoins + propertyAssetObject.price;

       ownerAsset = Buffer.from(JSON.stringify(ownerAssetObject));

       await ctx.stub.putState(ownerAssetKey, ownerAsset);

       return JSON.parse(propertyAsset.toString());

   }




}

module.exports=UserContract;