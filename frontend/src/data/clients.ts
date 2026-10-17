import type { Client } from '../types/client'

export const clients: Client[] = [
  { id: 'client-001', firstName: 'Mariana', lastName: 'Sánchez', fullName: 'Mariana Sánchez', phone: '55 1234 5678', email: 'mariana.sanchez@example.com', createdAt: '2026-09-02', notes: 'Prefiere comunicación por correo.', status: 'active' },
  { id: 'client-002', firstName: 'Carlos', lastName: 'Mendoza', fullName: 'Carlos Mendoza', phone: '81 2345 6789', email: 'carlos.mendoza@example.com', createdAt: '2026-09-05', status: 'active' },
  { id: 'client-003', firstName: 'Laura', lastName: 'Hernández', fullName: 'Laura Hernández', phone: '33 3456 7890', email: 'laura.hernandez@example.com', createdAt: '2026-09-09', status: 'inactive' },
  { id: 'client-004', firstName: 'Roberto', lastName: 'Aguilar', fullName: 'Roberto Aguilar', phone: '55 4567 8901', email: 'roberto.aguilar@example.com', createdAt: '2026-09-12', notes: 'Viaja con familia.', status: 'active' },
  { id: 'client-005', firstName: 'Andrea', lastName: 'Valdés', fullName: 'Andrea Valdés', phone: '55 5678 9012', email: 'andrea.valdes@example.com', createdAt: '2026-09-18', status: 'active' },
  { id: 'client-006', firstName: 'José Luis', lastName: 'Castro', fullName: 'José Luis Castro', phone: '81 6789 0123', email: 'jose.castro@example.com', createdAt: '2026-09-21', status: 'active' },
  { id: 'client-007', firstName: 'Fernanda', lastName: 'Ruiz', fullName: 'Fernanda Ruiz', phone: '33 7890 1234', email: 'fernanda.ruiz@example.com', createdAt: '2026-09-25', status: 'inactive' },
  { id: 'client-008', firstName: 'Miguel', lastName: 'Torres', fullName: 'Miguel Torres', phone: '55 8901 2345', email: 'miguel.torres@example.com', createdAt: '2026-09-29', status: 'active' },
  { id: 'client-009', firstName: 'Paola', lastName: 'Jiménez', fullName: 'Paola Jiménez', phone: '81 9012 3456', email: 'paola.jimenez@example.com', createdAt: '2026-10-02', status: 'active' },
  { id: 'client-010', firstName: 'Ricardo', lastName: 'Luna', fullName: 'Ricardo Luna', phone: '33 0123 4567', email: 'ricardo.luna@example.com', createdAt: '2026-10-06', status: 'active' },
  { id: 'client-011', firstName: 'Elena', lastName: 'Navarro', fullName: 'Elena Navarro', phone: '55 2468 1357', email: 'elena.navarro@example.com', createdAt: '2026-10-10', notes: 'Solicita opciones con desayuno incluido.', status: 'active' },
  { id: 'client-012', firstName: 'Gabriel', lastName: 'Rojas', fullName: 'Gabriel Rojas', phone: '81 1357 2468', email: '', createdAt: '2026-10-14', status: 'inactive' },
]
