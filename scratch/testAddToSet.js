const path = require("path");
module.paths.push(path.join(__dirname, "../backend/node_modules"));
const mongoose = require("mongoose");
const testSchema = new mongoose.Schema({ readBy: [{ type: mongoose.Schema.Types.ObjectId }] });
const TestDoc = mongoose.model("TestDoc", testSchema);

async function run() {
  const { MongoMemoryServer } = require("mongodb-memory-server");
  const mem = await MongoMemoryServer.create({ binary: { version: "7.0.14" } });
  await mongoose.connect(mem.getUri());

  const id1 = new mongoose.Types.ObjectId();
  const id2 = new mongoose.Types.ObjectId();

  // Test WITHOUT $each (Current Broken Implementation)
  const doc1 = await TestDoc.create({ readBy: [] });
  await TestDoc.findByIdAndUpdate(doc1._id, { $addToSet: { readBy: [id1, id2] } });
  const res1 = await TestDoc.findById(doc1._id);
  console.log("Without $each - readBy contents:", res1.readBy);
  const match1 = await TestDoc.find({ _id: doc1._id, readBy: { $nin: [id1, id2] } });
  console.log("Without $each - query find $nin count (1 means it is STILL returned despite being 'dismissed'!):", match1.length);

  // Test WITH $each (Correct Implementation)
  const doc2 = await TestDoc.create({ readBy: [] });
  await TestDoc.findByIdAndUpdate(doc2._id, { $addToSet: { readBy: { $each: [id1, id2] } } });
  const res2 = await TestDoc.findById(doc2._id);
  console.log("With $each - readBy contents:", res2.readBy);
  const match2 = await TestDoc.find({ _id: doc2._id, readBy: { $nin: [id1, id2] } });
  console.log("With $each - query find $nin count (0 means correctly filtered out):", match2.length);

  await mongoose.disconnect();
  await mem.stop();
}
run();
