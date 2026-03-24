exports.up = function(knex) {
  return knex.schema
    // 1. Tạo bảng Phương tiện (Vehicles)
    .createTable('Vehicles', table => {
      table.string('license_plate').primary(); // Biển số làm khóa chính
      // Khóa ngoại liên kết với bảng Users
      table.integer('user_id').unsigned().references('user_id').inTable('Users').onDelete('CASCADE');
      table.string('vehicle_type').notNullable(); // Loại xe: Car, Motorbike
      table.boolean('is_default').defaultTo(false);
      table.timestamps(true, true);
    })
    
    // 2. Tạo bảng Vị trí đỗ (Parking_Slots)
    .createTable('Parking_Slots', table => {
      table.string('slot_id').primary(); // Mã ô: A1, B2...
      table.string('zone').notNullable(); // Khu vực: B1, B2
      table.string('slot_type').notNullable();
      table.string('status').defaultTo('Available'); // Available, Occupied, Reserved
      table.timestamps(true, true);
    })

    // 3. Tạo bảng Phiên đỗ xe (Parking_Sessions)
    .createTable('Parking_Sessions', table => {
      table.increments('session_id').primary(); // Mã phiên/mã vé
      table.string('license_plate').references('license_plate').inTable('Vehicles');
      table.string('slot_id').references('slot_id').inTable('Parking_Slots');
      table.integer('user_id').unsigned().references('user_id').inTable('Users');
      
      table.timestamp('booking_time');
      table.timestamp('check_in_time');
      table.timestamp('check_out_time');
      table.string('status').defaultTo('Active'); // Booked, Active, Completed
      table.decimal('total_fee', 14, 2).defaultTo(0.00);
      table.timestamps(true, true);
    });
};

exports.down = function(knex) {
  // Khi rollback phải xóa theo thứ tự ngược lại để không dính lỗi khóa ngoại
  return knex.schema
    .dropTableIfExists('Parking_Sessions')
    .dropTableIfExists('Parking_Slots')
    .dropTableIfExists('Vehicles');
};