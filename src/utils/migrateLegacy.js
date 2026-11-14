import Product from '../models/Product.js';
import User from '../models/User.js';

// One-time, idempotent: links pre-multi-shop users/products to the oldest admin's shop.
export const migrateLegacyData = async () => {
  const [orphanUsers, orphanProducts] = await Promise.all([
    User.countDocuments({ shopId: { $exists: false } }),
    Product.countDocuments({ shopId: { $exists: false } })
  ]);

  if (orphanUsers === 0 && orphanProducts === 0) return;

  const owner =
    (await User.findOne({ role: 'admin' }).sort({ createdAt: 1 })) ||
    (await User.findOne().sort({ createdAt: 1 }));

  if (!owner) return;

  if (!owner.shopId) {
    owner.shopId = owner._id;
    await owner.save();
  }

  await User.updateMany({ shopId: { $exists: false } }, { $set: { shopId: owner.shopId } });
  await Product.updateMany({ shopId: { $exists: false } }, { $set: { shopId: owner.shopId } });
  console.log(`Migrated legacy data to shop ${owner.shopId}`);
};
