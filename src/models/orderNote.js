import { DataTypes, Model } from 'sequelize';

export class OrderNoteModel extends Model {}

export function initOrderNote(sequelize) {
  OrderNoteModel.init({
    id: { 
      type: DataTypes.INTEGER.UNSIGNED, 
      autoIncrement: true, 
      primaryKey: true 
    },
    order_id: { 
      type: DataTypes.INTEGER.UNSIGNED, 
      allowNull: false,
      references: {
        model: 'orders',
        key: 'id'
      },
      onDelete: 'CASCADE'
    },
    note: { 
      type: DataTypes.TEXT, 
      allowNull: false 
    },
    created_by: { 
      type: DataTypes.STRING(100), 
      allowNull: true 
    },
    updated_by: { 
      type: DataTypes.STRING(100), 
      allowNull: true 
    }
  }, {
    sequelize,
    modelName: 'OrderNote',
    tableName: 'order_notes',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });
  
  return OrderNoteModel;
}

