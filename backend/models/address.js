const { db } = require('../config/config');

class Address {
    // 获取用户所有地址
    static async getByUserId(userId) {
        const query = `
      SELECT * FROM addresses 
      WHERE user_id = ? 
      ORDER BY is_default DESC, created_at DESC`;
        return new Promise((resolve, reject) => {
            db.query(query, [userId], (err, results) => {
                if (err) reject(err);
                else resolve([results]);
            });
        });
    }

    // 获取单个地址详情
    static async getById(addressId) {
        const query = `SELECT * FROM addresses WHERE address_id = ?`;
        return new Promise((resolve, reject) => {
            db.query(query, [addressId], (err, results) => {
                if (err) reject(err);
                else resolve(results[0]);
            });
        });
    }

    // 创建新地址
    static async create(addressData) {
        // 如果设为默认地址，先将该用户的所有地址设为非默认
        if (addressData.is_default) {
            await this.resetDefaultAddress(addressData.user_id);
        }

        const query = `
      INSERT INTO addresses 
      (user_id, name, phone, province, city, district, address, is_default) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;

        return new Promise((resolve, reject) => {
            db.query(query, [
                addressData.user_id,
                addressData.name,
                addressData.phone,
                addressData.province,
                addressData.city,
                addressData.district,
                addressData.address,
                addressData.is_default ? 1 : 0
            ], (err, result) => {
                if (err) reject(err);
                else resolve(result.insertId);
            });
        });
    }

    // 更新地址
    static async update(addressId, addressData) {
        // 如果设为默认地址，先将该用户的所有地址设为非默认
        if (addressData.is_default) {
            await this.resetDefaultAddress(addressData.user_id);
        }

        const query = `
      UPDATE addresses 
      SET name = ?, phone = ?, province = ?, city = ?, 
          district = ?, address = ?, is_default = ? 
      WHERE address_id = ?`;

        return new Promise((resolve, reject) => {
            db.query(query, [
                addressData.name,
                addressData.phone,
                addressData.province,
                addressData.city,
                addressData.district,
                addressData.address,
                addressData.is_default ? 1 : 0,
                addressId
            ], (err, result) => {
                if (err) reject(err);
                else resolve(result);
            });
        });
    }

    // 删除地址
    static async delete(addressId) {
        const query = `DELETE FROM addresses WHERE address_id = ?`;
        return new Promise((resolve, reject) => {
            db.query(query, [addressId], (err, result) => {
                if (err) reject(err);
                else resolve(result);
            });
        });
    }

    // 设置默认地址
    static async setDefault(userId, addressId) {
        // 先将该用户的所有地址设为非默认
        await this.resetDefaultAddress(userId);

        // 再将指定地址设为默认
        const query = `UPDATE addresses SET is_default = 1 WHERE address_id = ?`;
        return new Promise((resolve, reject) => {
            db.query(query, [addressId], (err, result) => {
                if (err) reject(err);
                else resolve(result);
            });
        });
    }

    // 重置用户的默认地址
    static async resetDefaultAddress(userId) {
        const query = `UPDATE addresses SET is_default = 0 WHERE user_id = ?`;
        return new Promise((resolve, reject) => {
            db.query(query, [userId], (err, result) => {
                if (err) reject(err);
                else resolve(result);
            });
        });
    }
}

module.exports = Address;