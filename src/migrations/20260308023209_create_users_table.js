exports.up = function(knex) {
  return knex.schema.createTable('Users', table => {
    // Khóa chính (Primary Key) tự động tăng
    table.increments('user_id').primary(); 
    
    // Các cột thông tin cơ bản
    table.string('full_name').notNullable();
    table.string('phone_number').unique().notNullable(); // unique: Không được trùng số điện thoại
    table.string('password_hash').notNullable();
    table.string('role').defaultTo('Guest'); // Phân quyền mặc định là Guest
    
    // Ví điện tử (Lưu số tiền lớn tới 14 chữ số, 2 số thập phân)
    table.decimal('wallet_balance', 14, 2).defaultTo(0.00); 
    
    // Tự động tạo 2 cột: created_at và updated_at
    table.timestamps(true, true); 
  });
};

exports.down = function(knex) {
  // Lệnh dùng để xóa bảng nếu muốn rollback (làm lại)
  return knex.schema.dropTableIfExists('Users'); 
};