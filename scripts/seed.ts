import dotenv from "dotenv";
dotenv.config();

import sequelize from "../config/database";
import {
  Patient,
  Medication,
  Order,
  OrderMedication,
  FollowUp,
  Contact,
  Notification,
  ActivityLog,
} from "../models";

const d = (str: string) => new Date(str);

const CYCLE_LENGTH = 30;
const TODAY = new Date("2026-09-05T12:00:00Z");

function addDays(date: Date, days: number): Date {
  const r = new Date(date);
  r.setUTCDate(r.getUTCDate() + days);
  return r;
}

function toStr(date: Date): string {
  return date.toISOString().split("T")[0];
}

function daysBetween(a: Date, b: Date): number {
  return Math.floor((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24));
}

function calcPickups(firstPickup: Date): Date[] {
  const pickups: Date[] = [];
  let cur = new Date(firstPickup);
  while (cur <= TODAY) {
    pickups.push(new Date(cur));
    cur = addDays(cur, CYCLE_LENGTH);
  }
  return pickups;
}

function currentStatus(lastPickup: Date): string {
  const days = daysBetween(lastPickup, TODAY);
  if (days >= 30) return "prepared";
  if (days === 29) return "order_received";
  if (days === 28) return "contacted";
  if (days >= 25) return "pending_contact";
  return "delivered";
}

interface PatientSpec {
  name: string;
  dni: string;
  phone: string;
  email: string | null;
  address: string | null;
  healthInsurance: string;
  memberNumber: string;
  notes: string | null;
  registrationDate: string;
  firstPickupDate: string;
  medication: string;
}

type Med = { id: string; name: string };
type Pat = { id: string; name: string };
type Ordr = { id: string; patientId: string; patientName: string };
type Log = { id: string; patientId: string };
type FU = { id: string };
type Cont = { id: string };

const patientSpecs: PatientSpec[] = [
  // ── APRIL (1) ──
  {
    name: "Marta Costa",
    dni: "28-4567-8901",
    phone: "11-4421-3365",
    email: "marta.costa@gmail.com",
    address: "Av. Rivadavia 4520, CABA",
    healthInsurance: "OSDE",
    memberNumber: "OSDE-12345",
    notes: "Paciente con hipertension, requiere seguimiento mensual.",
    registrationDate: "2026-04-02T09:15:00Z",
    firstPickupDate: "2026-05-08T12:00:00Z",
    medication: "Losartan 50mg",
  },
  // ── MAY (1) ──
  {
    name: "Roberto Garcia",
    dni: "30-1234-5678",
    phone: "11-5589-2211",
    email: "r.garcia@hotmail.com",
    address: "Belgrano 1230, CABA",
    healthInsurance: "Swiss Medical",
    memberNumber: "SM-67890",
    notes: "Diabetico tipo 2. Retiros mensuales.",
    registrationDate: "2026-05-01T14:30:00Z",
    firstPickupDate: "2026-05-15T12:00:00Z",
    medication: "Metformina 850mg",
  },
  // ── JUNE (2) ──
  {
    name: "Ana Pereyra",
    dni: "27-8765-4321",
    phone: "11-6677-4455",
    email: "ana.pereyra@yahoo.com.ar",
    address: "San Martin 890, Flores",
    healthInsurance: "IOMA",
    memberNumber: "IOMA-11223",
    notes: "Tratamiento antibiotico recurrente.",
    registrationDate: "2026-06-01T11:00:00Z",
    firstPickupDate: "2026-06-09T12:00:00Z",
    medication: "Amoxicilina 500mg",
  },
  {
    name: "Jorge Luis Benitez",
    dni: "32-5566-7788",
    phone: "11-3344-8899",
    email: null,
    address: null,
    healthInsurance: "N/A",
    memberNumber: "N/A",
    notes: "Sin obra social. Paga en efectivo.",
    registrationDate: "2026-06-10T16:45:00Z",
    firstPickupDate: "2026-06-20T12:00:00Z",
    medication: "Paracetamol 500mg",
  },
  // ── JULY (2) ──
  {
    name: "Fernando Diaz",
    dni: "31-3344-1122",
    phone: "11-9988-7766",
    email: "fdiaz@gmail.com",
    address: "Av. Callao 1500, Recoleta",
    healthInsurance: "OSDE",
    memberNumber: "OSDE-78901",
    notes: "Tratamiento prolongado con Losartan.",
    registrationDate: "2026-07-01T08:30:00Z",
    firstPickupDate: "2026-07-11T12:00:00Z",
    medication: "Losartan 50mg",
  },
  {
    name: "Susana Rios",
    dni: "29-9988-7766",
    phone: "11-2233-5566",
    email: "srios@outlook.com",
    address: "Corrientes 5678, Balvanera",
    healthInsurance: "Galeno",
    memberNumber: "GAL-44556",
    notes: "Paciente con asma, uso de spray broncodilatador.",
    registrationDate: "2026-07-10T10:20:00Z",
    firstPickupDate: "2026-07-22T12:00:00Z",
    medication: "Salbutamol Spray",
  },
  // ── AUGUST (1) ──
  {
    name: "Carlos Munoz",
    dni: "33-2211-4433",
    phone: "11-8877-6655",
    email: "cmunoz@hotmail.com",
    address: "Lavalle 2340, Balvanera",
    healthInsurance: "OSDE",
    memberNumber: "OSDE-55667",
    notes: null,
    registrationDate: "2026-08-01T09:00:00Z",
    firstPickupDate: "2026-08-14T12:00:00Z",
    medication: "Omeprazol 20mg",
  },
  // ── SEPTEMBER (1) ──
  {
    name: "Laura Sanchez",
    dni: "26-5544-3322",
    phone: "11-4433-2211",
    email: "lsanchez@gmail.com",
    address: "Av. Corrientes 8900, Balvanera",
    healthInsurance: "IOMA",
    memberNumber: "IOMA-99001",
    notes: "Paciente nueva, control de presion arterial.",
    registrationDate: "2026-09-01T15:00:00Z",
    firstPickupDate: "2026-09-05T12:00:00Z",
    medication: "Losartan 50mg",
  },
];

async function seed() {
  try {
    await sequelize.authenticate();
    console.log("Seed: DB connected.");

    // ── Medications ──────────────────────────────────────
    const meds = await Medication.bulkCreate([
      { name: "Paracetamol 500mg" },
      { name: "Ibuprofeno 400mg" },
      { name: "Amoxicilina 500mg" },
      { name: "Omeprazol 20mg" },
      { name: "Losartan 50mg" },
      { name: "Metformina 850mg" },
      { name: "Salbutamol Spray" },
      { name: "Dexametasona 4mg" },
    ]);
    console.log(`Seeded ${meds.length} medications.`);

    const findMed = (name: string) => (meds as unknown as Med[]).find((m) => m.name === name)!;

    // ── Contacts ─────────────────────────────────────────
    const contacts = (await Contact.bulkCreate([
      {
        name: "Distribuidora PharmaPlus",
        phone: "11-4567-8900",
        email: "ventas@pharmaplus.com.ar",
        category: "supplier",
      },
      {
        name: "Motoya Express",
        phone: "11-3322-1100",
        email: "contacto@motoyaexpress.com",
        category: "delivery",
      },
      {
        name: "Dr. Carlos Mendez",
        phone: "11-5544-3322",
        email: "cmendez@clinicamedica.com.ar",
        category: "doctor",
      },
      {
        name: "Laboratorio BioChem",
        phone: "11-7788-9900",
        email: "pedidos@biochem.com.ar",
        category: "lab",
      },
      {
        name: "Dra. Lucia Fernandez",
        phone: "11-6677-8899",
        email: "lfernandez@salmud.com.ar",
        category: "doctor",
      },
    ])) as unknown as Cont[];
    console.log(`Seeded ${contacts.length} contacts.`);

    // ── Patients ─────────────────────────────────────────
    const patients = (await Patient.bulkCreate(
      patientSpecs.map((s) => ({
        name: s.name,
        dni: s.dni,
        phone: s.phone,
        email: s.email,
        address: s.address,
        healthInsurance: s.healthInsurance,
        memberNumber: s.memberNumber,
        status: "active" as const,
        notes: s.notes,
        createdAt: d(s.registrationDate),
      })),
    )) as unknown as Pat[];
    console.log(`Seeded ${patients.length} patients.`);

    // ── Orders, FollowUps, ActivityLogs ──────────────────
    const allLogs: Array<{
      patientId: string;
      type: string;
      description: string;
      metadata: Record<string, unknown> | null;
      createdAt: Date;
    }> = [];

    const followUpsToCreate: Array<{
      patientId: string;
      patientName: string;
      orderId: string;
      medication: string;
      status: string;
      scheduledDate: string;
      notes: string;
      createdAt: Date;
    }> = [];

    for (let i = 0; i < patients.length; i++) {
      const spec = patientSpecs[i];
      const patient = patients[i];
      const firstPickup = d(spec.firstPickupDate);
      const pickups = calcPickups(firstPickup);
      const lastPickup = pickups[pickups.length - 1];
      const nextPickup = addDays(lastPickup, CYCLE_LENGTH);
      const status = currentStatus(lastPickup);

      // Create order
      const order = (await Order.create({
        patientId: patient.id,
        patientName: patient.name,
        lastPickupDate: toStr(lastPickup),
        nextPickupDate: toStr(nextPickup),
        notes: null,
        createdAt: addDays(d(spec.registrationDate), 1),
      })) as unknown as Ordr;

      // Create order medication
      await OrderMedication.create({
        orderId: order.id,
        medicationId: findMed(spec.medication).id,
        medicationName: spec.medication,
        quantity: "1",
      });

      // Prepare follow-up
      const followUpNotes =
        status === "delivered"
          ? "Retiro exitoso"
          : status === "prepared"
            ? "Retiro proximo"
            : status === "contacted"
              ? "Se contacto, confirma retiro"
              : status === "order_received"
                ? "Orden recibida, pendiente preparacion"
                : "Pendiente de contacto";

      followUpsToCreate.push({
        patientId: patient.id,
        patientName: patient.name,
        orderId: order.id,
        medication: spec.medication,
        status,
        scheduledDate: toStr(nextPickup),
        notes: followUpNotes,
        createdAt: addDays(d(spec.registrationDate), 1),
      });

      // ── Activity Logs ────────────────────────────────
      const orderCreatedDate = addDays(d(spec.registrationDate), 1);

      // Patient registered
      allLogs.push({
        patientId: patient.id,
        type: "patient_registered",
        description: `Paciente ${patient.name} registrado en el sistema`,
        metadata: null,
        createdAt: d(spec.registrationDate),
      });

      // Order created
      allLogs.push({
        patientId: patient.id,
        type: "order_created",
        description: `Orden creada para ${patient.name}`,
        metadata: { orderId: order.id },
        createdAt: orderCreatedDate,
      });

      for (let c = 0; c < pickups.length; c++) {
        const pickup = pickups[c];
        const isLast = c === pickups.length - 1;

        // order_received (1 day before pickup)
        const orDate = addDays(pickup, -1);
        if (c === 0) {
          allLogs.push({
            patientId: patient.id,
            type: "follow_up_status_changed",
            description: `${patient.name}: follow-up status changed to "orden recibida"`,
            metadata: { from: null, to: "order_received", medication: spec.medication },
            createdAt: orderCreatedDate,
          });
        } else {
          allLogs.push({
            patientId: patient.id,
            type: "follow_up_status_changed",
            description: `${patient.name}: follow-up status changed to "orden recibida"`,
            metadata: { from: "contacted", to: "order_received", medication: spec.medication },
            createdAt: orDate,
          });
        }

        // prepared
        allLogs.push({
          patientId: patient.id,
          type: "follow_up_status_changed",
          description: `${patient.name}: follow-up status changed to "preparado"`,
          metadata: { from: "order_received", to: "prepared", medication: spec.medication },
          createdAt: pickup,
        });

        // delivered
        allLogs.push({
          patientId: patient.id,
          type: "follow_up_status_changed",
          description: `${patient.name}: follow-up status changed to "entregado"`,
          metadata: { from: "prepared", to: "delivered", medication: spec.medication },
          createdAt: pickup,
        });

        // order_picked_up
        allLogs.push({
          patientId: patient.id,
          type: "order_picked_up",
          description: `Orden de ${patient.name} retirada el ${toStr(pickup)}`,
          metadata: { orderId: order.id, pickupDate: toStr(pickup) },
          createdAt: pickup,
        });

        // If not last pickup, add pending_contact and contacted for next cycle
        if (!isLast) {
          const nextP = pickups[c + 1];

          allLogs.push({
            patientId: patient.id,
            type: "follow_up_status_changed",
            description: `${patient.name}: follow-up status changed to "pendiente de contacto"`,
            metadata: { from: "delivered", to: "pending_contact", medication: spec.medication },
            createdAt: addDays(nextP, -5),
          });

          allLogs.push({
            patientId: patient.id,
            type: "follow_up_status_changed",
            description: `${patient.name}: follow-up status changed to "contactado"`,
            metadata: { from: "pending_contact", to: "contacted", medication: spec.medication },
            createdAt: addDays(nextP, -2),
          });
        }
      }

      // Add current-cycle status logs (after last pickup, before today)
      if (status !== "delivered") {
        const np = addDays(lastPickup, CYCLE_LENGTH);

        if (status === "pending_contact" || status === "contacted" || status === "order_received" || status === "prepared") {
          allLogs.push({
            patientId: patient.id,
            type: "follow_up_status_changed",
            description: `${patient.name}: follow-up status changed to "pendiente de contacto"`,
            metadata: { from: "delivered", to: "pending_contact", medication: spec.medication },
            createdAt: addDays(np, -5),
          });
        }
        if (status === "contacted" || status === "order_received" || status === "prepared") {
          allLogs.push({
            patientId: patient.id,
            type: "follow_up_status_changed",
            description: `${patient.name}: follow-up status changed to "contactado"`,
            metadata: { from: "pending_contact", to: "contacted", medication: spec.medication },
            createdAt: addDays(np, -2),
          });
        }
        if (status === "order_received" || status === "prepared") {
          allLogs.push({
            patientId: patient.id,
            type: "follow_up_status_changed",
            description: `${patient.name}: follow-up status changed to "orden recibida"`,
            metadata: { from: "contacted", to: "order_received", medication: spec.medication },
            createdAt: addDays(np, -1),
          });
        }
        if (status === "prepared") {
          allLogs.push({
            patientId: patient.id,
            type: "follow_up_status_changed",
            description: `${patient.name}: follow-up status changed to "preparado"`,
            metadata: { from: "order_received", to: "prepared", medication: spec.medication },
            createdAt: np,
          });
        }
      }
    }

    // Create follow-ups
    const followUps = (await FollowUp.bulkCreate(followUpsToCreate)) as unknown as FU[];
    console.log(`Seeded ${followUps.length} follow-ups.`);

    // Create activity logs (sorted by createdAt)
    allLogs.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
    const logs = (await ActivityLog.bulkCreate(
      allLogs.map((l) => ({
        ...l,
        metadata: l.metadata || undefined,
        createdAt: l.createdAt,
      })),
    )) as unknown as Log[];
    console.log(`Seeded ${logs.length} activity logs.`);

    // ── Notifications ────────────────────────────────────
    const notifications = await Notification.bulkCreate([
      {
        type: "contact_today",
        message: "Marta Costa tiene retiro programado el 05/09 de Losartan 50mg",
        patientId: patients[0].id,
        read: false,
      },
      {
        type: "upcoming_pickup",
        message: "Roberto Garcia tiene retiro pendiente el 15/09 de Metformina 850mg",
        patientId: patients[1].id,
        read: false,
      },
      {
        type: "contact_today",
        message: "Contactar a Fernando Diaz para confirmar retiro del 10/09",
        patientId: patients[4].id,
        read: false,
      },
      {
        type: "overdue_followup",
        message: "Carlos Munoz tiene un follow-up proximo a vencer (14/09)",
        patientId: patients[6].id,
        read: false,
      },
    ]);
    console.log(`Seeded ${notifications.length} notifications.`);

    console.log("\nSeed completed successfully!");
    console.log(`  Medications:    ${meds.length}`);
    console.log(`  Contacts:       ${contacts.length}`);
    console.log(`  Patients:       ${patients.length}`);
    console.log(`  Orders:         ${patients.length}`);
    console.log(`  Follow-ups:     ${followUps.length}`);
    console.log(`  Activity logs:  ${logs.length}`);
    console.log(`  Notifications:  ${notifications.length}`);
  } catch (err) {
    console.error("Seed failed:", err);
    throw err;
  }
}

export default seed;
