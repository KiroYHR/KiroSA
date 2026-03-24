exports.seed = async function(knex) {
  // Xóa dữ liệu cũ
  await knex('Parking_Slots').del();
  
  await knex('Parking_Slots').insert([
    // Làn A
    { slot_id: 'A1', zone: 'Tầng hầm B1', slot_type: 'Car', status: 'Occupied' },
    { slot_id: 'A2', zone: 'Tầng hầm B1', slot_type: 'Car', status: 'Occupied' }, 
    { slot_id: 'A3', zone: 'Tầng hầm B1', slot_type: 'Car', status: 'Available' },
    { slot_id: 'A4', zone: 'Tầng hầm B1', slot_type: 'Car', status: 'Reserved' },
    { slot_id: 'A5', zone: 'Tầng hầm B1', slot_type: 'Car', status: 'Occupied' },
    
    // Làn B
    { slot_id: 'B1', zone: 'Tầng hầm B1', slot_type: 'Car', status: 'Available' },
    { slot_id: 'B2', zone: 'Tầng hầm B1', slot_type: 'Car', status: 'Occupied' },
    { slot_id: 'B3', zone: 'Tầng hầm B1', slot_type: 'Car', status: 'Available' },
    { slot_id: 'B4', zone: 'Tầng hầm B1', slot_type: 'Car', status: 'Available' },
    { slot_id: 'B5', zone: 'Tầng hầm B1', slot_type: 'Car', status: 'Available' }
  ]);
};