const Variant = require('../models/Variant');

class VariantRepository {
    async create(variantData) { return new Variant(variantData).save(); }
    async updateById(id, updateData) { return Variant.findByIdAndUpdate(id, updateData, { new: true, runValidators: true }); }
    async deleteById(id) { return Variant.findByIdAndDelete(id); }

    /**
     * Finds multiple variants by their IDs within a transaction session.
     * @param {Array<string>} ids - An array of variant IDs.
     * @param {object} session - The mongoose transaction session.
     * @returns {Promise<Array<Document>>} A list of found variants.
     */
    async findManyByIdsWithSession(ids, session) {
        return Variant.find({ '_id': { $in: ids } }).session(session);
    }

    /**
     * Atomically updates the stock of a variant.
     * @param {string} variantId - The ID of the variant.
     * @param {number} quantityChange - The amount to change the stock by (can be positive or negative).
     * @param {object} session - The mongoose transaction session.
     * @returns {Promise<Document>} The updated variant document.
     */
    async updateStock(variantId, quantityChange, session) {
        return Variant.findByIdAndUpdate(
            variantId,
            { $inc: { stock: quantityChange } },
            { new: true, session }
        );
    }
    /**
     * Deletes all variants that belong to a specific product.
     * @param {string} productId - The ID of the parent product.
     */
    async deleteByProductId(productId) {
        return Variant.deleteMany({ product: productId });
    }
}

module.exports = new VariantRepository();