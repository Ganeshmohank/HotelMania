// const mongoose = require('mongoose');
// const Booking = require('./models/Booking'); // Make sure this path is correct

// const mongoURI = 'mongodb+srv://mohankancherla519:nPdoiGx51WRHit9R@cluster1.ueedc.mongodb.net/booktable?retryWrites=true&w=majority';

// mongoose.connect(mongoURI)
//   .then(() => console.log('✅ Connected to MongoDB'))
//   .catch(err => console.error('❌ Connection error:', err));

// // Replace with the IDs you want to delete

// const idsToDelete = [
//   "1bb37df93b8048bb98609da9",
//   "2edb6ebcc3814e3084a14ffa",
//   "016c2488a74b4e2ea5236649",
//   "5b15cb2e1af24725a8388214",
//   "41b9b199255548489210038b",
//   "b9a0b2cfbded481db0a0a4e0",
//   "cb2b2ef72a6044b8ade4e5a2",
//   "ed42b3574b284a9e82bd1c86",
//   "e1ac9612f1584e14bbb6924f",
//   "a2ddb82f6f764eabb0f26e51",
//   "44106cb4961d4e5cba85feb2",
//   "6d40d4903665477ebac47bda",
//   "61e6e983a98044f39c910b25",
//   "2813bab251d843e78d0f2959",
//   "918302a525c74deeae4725ad",
//   "b26802f7ab174028a81f94fd"
//   // Add more if needed
// ];

// async function deleteBookings() {
//   try {
//     const result = await Booking.deleteMany({ _id: { $in: idsToDelete } });
//     console.log(`✅ Deleted ${result.deletedCount} bookings.`);
//   } catch (err) {
//     console.error('❌ Error during deletion:', err.message);
//   } finally {
//     mongoose.connection.close();
//   }
// }

// deleteBookings();


const { MongoClient } = require('mongodb');

const mongoURI = 'mongodb+srv://mohankancherla519:nPdoiGx51WRHit9R@cluster1.ueedc.mongodb.net/booktable?retryWrites=true&w=majority';
const client = new MongoClient(mongoURI);

async function deleteDocuments() {
  try {
    await client.connect();
    const db = client.db('booktable');
    const collection = db.collection('restaurants'); // Replace this

    const idsToDelete = [
      "a037425b911c4f0f816c7f6c", "dc4f89e2b3f243c08410480f", "016c2488a74b4e2ea5236649",
      "5b15cb2e1af24725a8388214", "41b9b199255548489210038b", "b9a0b2cfbded481db0a0a4e0",
      "cb2b2ef72a6044b8ade4e5a2", "ed42b3574b284a9e82bd1c86", "e1ac9612f1584e14bbb6924f",
      "a2ddb82f6f764eabb0f26e51", "a065351b9dc240388bc9b352", "fdcd762e3c114f12b527e88b",
      "9b357fc3dd4344c5b21c40a0", "2cc8880dfc2a48959e43a3a1", "d820872db8474a5fbc3459b1",
      "f99606c3a1f3489a81c7b60e", "4195074b1fd74c89b7197c82", "0088415c6efc413292cb4f79",
      "f1901450c40d43fc982c8e2a", "5486e72aaf874be08800ef9b", "b5b2c3075d3d4ef381f7c635",
      "1e46a4a2eb9849998f23b62f", "10f82d6dcfac4d3b93b24853", "171b6c57d529417c88516a2b",
      "3c79f92937fd47c58e94a8f5", "4c716e46e39a468ab7743be3", "5f4d35978e23455b8e14f5ef",
      "360d6cbb347140cb998476dc", "f6a0dbbd2d4747ae8eec2b96", "314af06ecf8c4e2786e5be5b",
      "06e34b9df62a4b688ffb2df5", "23ce3f6c51d247c8a50fd5ae", "2210ac519a064c109f65df00",
      "43d26d2e10a94eac8d166d2b", "1d7d6b30aab541d3a4f385c1", "b3259bc4965740bdb4e34f1e",
      "c7753181b2f74114b6899ef7", "1f69c04a79074b059df7b9c0", "ba0e779b63c04698bb3a39b2",
      "ea3d450d9c334ab3b4935358", "6c595d6ac23f4170b36dc886", "c5136c50a6784d1495a88b58",
      "2793fdb152c44f2e94959b68", "e961ae47114d4ab1b8d8e983", "f2a9d4130f6f4d38bc0f9de2",
      "5b1b8d3d10b84c53b53e9e6a", "961bbf4b13264f54be4ef449", "5477a95d963e4fe08a0fc1b5",
      "e925bd362f1a47b5bd6e6db3", "4a6c09b4a9db4d1b86f04ea7", "0e92449853e045f2b9843b79",
      "50d5667fa7c948c586b574b4", "f72b4b0291cf4f3db3e5ce70", "8d93d03440514e0a8b3f6ccf",
      "529e6c511e1942c2b97e6a82", "b4783aa9d6de4cf2b5e986a3", "2e6c0617f97f4b3a8e615c6e",
      "02b6ce786a4a4609bd014259", "21d6ec937d654df28e35276f", "b204e453f3de4c2c89a5be12",
      "95e7b2ac54454d8bb4730555", "3ce2c398d6474322bb0d1c39", "85eaad7d6e3b4688adf96db2",
      "c2b0cf8b04f743c3a2ee5acb", "6d9222ab38a24f07be1eaf3d", "2ffbacc11f59425cb2f594be",
      "4fe8a5736c7f47288b0c39d2", "f3e431805be14ff796e5e2c6", "9bdfd0d1b1744122ae23116e",
      "16cb2ff1b34e4c4791d92b7e", "4ed4b58d62d54ce882c90933", "c387fefdd72a4a1c8f0d2f50",
      "ba10b0f222e8458cb405f60f", "4dbe876e7ab1423aa08c7fd6", "249d0d9e9e4f4905b15fcd9a",
      "baaf32d39a474f58a9ed9347", "07026bc8cf3e4ae3a7f0a381", "09e42c0dc4b1489b8a9c65c4",
      "b0c2b983a05e472f84a20a41", "8aed65eec7e346c7b6704d95", "22487f1f9fb54da9ae8463bb",
      "1861123e96ac4b2c910b15a4", "96d28ed2aa3e4c6db1120ec3", "c217b3652d7b445eb5a2735c",
      "f84934fa35324a1e89fca241", "f9e847799ff24f1c859aaac8", "7d1967c38cbd48c193bcf33c",
      "ea1b6b2f38cf4dfd9365d74f", "63396c176a0a426db1445974", "3319c33b08e3455bbd1e1de7",
      "302b32ebed4a4596ae4d30c1", "37dd04b1344b44e9b36530d4", "bc9897a4c4944c309e88ac7e",
      "20460f88c2d546f3a3a0e3df", "a89cc8f690204ad49b13c001", "217ef1d8f19f438c85b47b69",
      "d3b6217e21c74e648703b260", "0a9d88d3097646e09f2f390b", "493f7d1440274be89e1d1122",
      "68218c96816924e69c0a1473"
    ]

    const result = await collection.deleteMany({ _id: { $in: idsToDelete } });

    console.log(`✅ Deleted ${result.deletedCount} documents`);
  } catch (error) {
    console.error('❌ Error deleting documents:', error);
  } finally {
    await client.close();
  }
}

deleteDocuments();
