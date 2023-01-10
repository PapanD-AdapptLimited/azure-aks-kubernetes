

Azure AKS provisions two types of storage classes 
1. managed-premium
2. default-**
We can leverage Azure AKS provisioned disk storage classes instead of what we created manually.

need to change "managed-premium" Storage Class to "storageaccounttype" to Standard_LRS.
