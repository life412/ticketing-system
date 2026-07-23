import { PrismaClient, Role, TicketStatus, TicketPriority, TicketCategory, ActionType } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

interface SeedActivity {
  userId: string;
  text: string;
  actionType: ActionType;
  previousStatus?: TicketStatus;
  newStatus?: TicketStatus;
}

interface SeedTicket {
  title: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  category: TicketCategory;
  creatorId: string;
  assigneeId: string | null;
  activities: SeedActivity[];
}

async function main() {
  console.log("🌱 Starting database seeding...");

  // 1. Clear Existing Data
  console.log("🧹 Clearing existing database records...");
  await prisma.activity.deleteMany({});
  await prisma.ticket.deleteMany({});
  await prisma.user.deleteMany({});

  // 2. Hash Default Password
  const passwordHash = await bcrypt.hash("password123", 10);

  // 3. Create Users (2 Managers, 3 Techs, 3 Employees)
  console.log("👤 Creating user accounts...");

  const manager1 = await prisma.user.create({
    data: {
      email: "manager1@company.com",
      passwordHash,
      name: "Sarah Jenkins (Senior IT Manager)",
      role: Role.MANAGER,
    },
  });

  const manager2 = await prisma.user.create({
    data: {
      email: "manager2@company.com",
      passwordHash,
      name: "David Ross (Operations Manager)",
      role: Role.MANAGER,
    },
  });

  const tech1 = await prisma.user.create({
    data: {
      email: "tech1@company.com",
      passwordHash,
      name: "Alex Vance (Lead Network Tech)",
      role: Role.TECH,
    },
  });

  const tech2 = await prisma.user.create({
    data: {
      email: "tech2@company.com",
      passwordHash,
      name: "Elena Rostova (Hardware Specialist)",
      role: Role.TECH,
    },
  });

  const tech3 = await prisma.user.create({
    data: {
      email: "tech3@company.com",
      passwordHash,
      name: "Marcus Chen (SysAdmin & Security)",
      role: Role.TECH,
    },
  });

  const emp1 = await prisma.user.create({
    data: {
      email: "emp1@company.com",
      passwordHash,
      name: "Emily Watson (Marketing Lead)",
      role: Role.EMPLOYEE,
    },
  });

  const emp2 = await prisma.user.create({
    data: {
      email: "emp2@company.com",
      passwordHash,
      name: "Jordan Lee (Financial Analyst)",
      role: Role.EMPLOYEE,
    },
  });

  const emp3 = await prisma.user.create({
    data: {
      email: "emp3@company.com",
      passwordHash,
      name: "Carlos Mendez (HR Generalist)",
      role: Role.EMPLOYEE,
    },
  });

  console.log("✅ Created 8 user accounts.");

  // 4. Seed 15 Sample Tickets with Realistic Workflows and Comment Timelines
  console.log("🎫 Seeding 15 realistic tickets with activity logs...");

  const ticketsData: SeedTicket[] = [
    {
      title: "VPN Authentication Fails for Remote Workstation",
      description: "Unable to connect to corporate Cisco VPN from home network. Error code 429.",
      status: TicketStatus.OPEN,
      priority: TicketPriority.HIGH,
      category: TicketCategory.IT_SUPPORT,
      creatorId: emp1.id,
      assigneeId: null,
      activities: [
        {
          userId: emp1.id,
          text: "Submitted support ticket.",
          actionType: ActionType.STATUS_CHANGE,
          newStatus: TicketStatus.OPEN,
        },
      ],
    },
    {
      title: "Monitors Flickering on Desk 4B",
      description: "Dual 27-inch Dell displays flicker randomly when connected via DisplayPort dock.",
      status: TicketStatus.ASSIGNED,
      priority: TicketPriority.MEDIUM,
      category: TicketCategory.IT_SUPPORT,
      creatorId: emp2.id,
      assigneeId: tech2.id,
      activities: [
        {
          userId: emp2.id,
          text: "Submitted support ticket.",
          actionType: ActionType.STATUS_CHANGE,
          newStatus: TicketStatus.OPEN,
        },
        {
          userId: manager1.id,
          text: `assigned ticket to ${tech2.name}`,
          actionType: ActionType.ASSIGNMENT,
          previousStatus: TicketStatus.OPEN,
          newStatus: TicketStatus.ASSIGNED,
        },
        {
          userId: tech2.id,
          text: "I will bring replacement Thunderbolt 4 cables to desk 4B shortly.",
          actionType: ActionType.COMMENT,
        },
      ],
    },
    {
      title: "Critical Security Audit Log Anomaly",
      description: "Unexpected spike in failed SSH attempts logged on internal staging database cluster.",
      status: TicketStatus.IN_PROGRESS,
      priority: TicketPriority.CRITICAL,
      category: TicketCategory.IT_SUPPORT,
      creatorId: emp3.id,
      assigneeId: tech3.id,
      activities: [
        {
          userId: emp3.id,
          text: "Submitted critical security ticket.",
          actionType: ActionType.STATUS_CHANGE,
          newStatus: TicketStatus.OPEN,
        },
        {
          userId: manager1.id,
          text: `assigned ticket to ${tech3.name}`,
          actionType: ActionType.ASSIGNMENT,
          newStatus: TicketStatus.ASSIGNED,
        },
        {
          userId: tech3.id,
          text: "status changed to IN_PROGRESS",
          actionType: ActionType.STATUS_CHANGE,
          previousStatus: TicketStatus.ASSIGNED,
          newStatus: TicketStatus.IN_PROGRESS,
        },
        {
          userId: tech3.id,
          text: "Isolated IP range 192.168.1.40 and updated UFW firewall rules. Investigating logs.",
          actionType: ActionType.COMMENT,
        },
      ],
    },
    {
      title: "Conference Room B HVAC Temperature Control Issue",
      description: "Air conditioning is blowing hot air in Conference Room B during executive meetings.",
      status: TicketStatus.RESOLVED,
      priority: TicketPriority.HIGH,
      category: TicketCategory.FACILITIES,
      creatorId: emp1.id,
      assigneeId: tech1.id,
      activities: [
        {
          userId: emp1.id,
          text: "Submitted facilities ticket.",
          actionType: ActionType.STATUS_CHANGE,
          newStatus: TicketStatus.OPEN,
        },
        {
          userId: manager2.id,
          text: `assigned ticket to ${tech1.name}`,
          actionType: ActionType.ASSIGNMENT,
          newStatus: TicketStatus.ASSIGNED,
        },
        {
          userId: tech1.id,
          text: "status changed to IN_PROGRESS",
          actionType: ActionType.STATUS_CHANGE,
          previousStatus: TicketStatus.ASSIGNED,
          newStatus: TicketStatus.IN_PROGRESS,
        },
        {
          userId: tech1.id,
          text: "status changed to RESOLVED",
          actionType: ActionType.STATUS_CHANGE,
          previousStatus: TicketStatus.IN_PROGRESS,
          newStatus: TicketStatus.RESOLVED,
        },
        {
          userId: tech1.id,
          text: "Replaced thermostat sensor on zone 3. Temperature reset to 70°F.",
          actionType: ActionType.COMMENT,
        },
      ],
    },
    {
      title: "Onboarding Access Request for New Hiring Cohort",
      description: "Requesting Jira, GitHub, and Figma user licenses for 4 incoming software engineers starting Monday.",
      status: TicketStatus.CLOSED,
      priority: TicketPriority.MEDIUM,
      category: TicketCategory.HR,
      creatorId: emp3.id,
      assigneeId: tech2.id,
      activities: [
        {
          userId: emp3.id,
          text: "Submitted HR onboarding ticket.",
          actionType: ActionType.STATUS_CHANGE,
          newStatus: TicketStatus.OPEN,
        },
        {
          userId: manager1.id,
          text: `assigned ticket to ${tech2.name}`,
          actionType: ActionType.ASSIGNMENT,
          newStatus: TicketStatus.ASSIGNED,
        },
        {
          userId: tech2.id,
          text: "status changed to RESOLVED",
          actionType: ActionType.STATUS_CHANGE,
          previousStatus: TicketStatus.IN_PROGRESS,
          newStatus: TicketStatus.RESOLVED,
        },
        {
          userId: emp3.id,
          text: "status changed to CLOSED",
          actionType: ActionType.STATUS_CHANGE,
          previousStatus: TicketStatus.RESOLVED,
          newStatus: TicketStatus.CLOSED,
        },
        {
          userId: emp3.id,
          text: "All 4 accounts verified and credentials distributed. Closing request.",
          actionType: ActionType.COMMENT,
        },
      ],
    },
    {
      title: "Printer Cartridge Replacement in Accounting Dept",
      description: "Black toner cartridge empty on HP LaserJet printer 204.",
      status: TicketStatus.OPEN,
      priority: TicketPriority.LOW,
      category: TicketCategory.IT_SUPPORT,
      creatorId: emp2.id,
      assigneeId: null,
      activities: [
        {
          userId: emp2.id,
          text: "Submitted printer maintenance ticket.",
          actionType: ActionType.STATUS_CHANGE,
          newStatus: TicketStatus.OPEN,
        },
      ],
    },
    {
      title: "Keycard Scanner Failure at Main Entrance",
      description: "Card reader at South Entrance is not reading RFID badges. LED remains solid red.",
      status: TicketStatus.IN_PROGRESS,
      priority: TicketPriority.CRITICAL,
      category: TicketCategory.FACILITIES,
      creatorId: emp1.id,
      assigneeId: tech1.id,
      activities: [
        {
          userId: emp1.id,
          text: "Submitted security gate ticket.",
          actionType: ActionType.STATUS_CHANGE,
          newStatus: TicketStatus.OPEN,
        },
        {
          userId: manager2.id,
          text: `assigned ticket to ${tech1.name}`,
          actionType: ActionType.ASSIGNMENT,
          newStatus: TicketStatus.ASSIGNED,
        },
        {
          userId: tech1.id,
          text: "status changed to IN_PROGRESS",
          actionType: ActionType.STATUS_CHANGE,
          previousStatus: TicketStatus.ASSIGNED,
          newStatus: TicketStatus.IN_PROGRESS,
        },
        {
          userId: tech1.id,
          text: "Inspecting main controller board on South gate.",
          actionType: ActionType.COMMENT,
        },
      ],
    },
    {
      title: "Figma Professional License Transfer",
      description: "Transfer design license from contractor account to new UX staff engineer.",
      status: TicketStatus.ASSIGNED,
      priority: TicketPriority.LOW,
      category: TicketCategory.IT_SUPPORT,
      creatorId: emp3.id,
      assigneeId: tech3.id,
      activities: [
        {
          userId: emp3.id,
          text: "Submitted license request.",
          actionType: ActionType.STATUS_CHANGE,
          newStatus: TicketStatus.OPEN,
        },
        {
          userId: manager1.id,
          text: `assigned ticket to ${tech3.name}`,
          actionType: ActionType.ASSIGNMENT,
          newStatus: TicketStatus.ASSIGNED,
        },
      ],
    },
    {
      title: "Wi-Fi Access Point Dropping Connections on 3rd Floor",
      description: "AP-302 experiencing intermittent packet loss during peak hours (2 PM - 4 PM).",
      status: TicketStatus.IN_PROGRESS,
      priority: TicketPriority.HIGH,
      category: TicketCategory.IT_SUPPORT,
      creatorId: emp2.id,
      assigneeId: tech1.id,
      activities: [
        {
          userId: emp2.id,
          text: "Submitted network report.",
          actionType: ActionType.STATUS_CHANGE,
          newStatus: TicketStatus.OPEN,
        },
        {
          userId: manager1.id,
          text: `assigned ticket to ${tech1.name}`,
          actionType: ActionType.ASSIGNMENT,
          newStatus: TicketStatus.ASSIGNED,
        },
        {
          userId: tech1.id,
          text: "status changed to IN_PROGRESS",
          actionType: ActionType.STATUS_CHANGE,
          previousStatus: TicketStatus.ASSIGNED,
          newStatus: TicketStatus.IN_PROGRESS,
        },
        {
          userId: tech1.id,
          text: "Running channel frequency scan on 5GHz spectrum.",
          actionType: ActionType.COMMENT,
        },
      ],
    },
    {
      title: "Payroll Software Export Timeout",
      description: "Generating Q3 CSV payroll summary throws gateway timeout 504.",
      status: TicketStatus.RESOLVED,
      priority: TicketPriority.HIGH,
      category: TicketCategory.OTHER,
      creatorId: emp2.id,
      assigneeId: tech3.id,
      activities: [
        {
          userId: emp2.id,
          text: "Submitted payroll export ticket.",
          actionType: ActionType.STATUS_CHANGE,
          newStatus: TicketStatus.OPEN,
        },
        {
          userId: manager2.id,
          text: `assigned ticket to ${tech3.name}`,
          actionType: ActionType.ASSIGNMENT,
          newStatus: TicketStatus.ASSIGNED,
        },
        {
          userId: tech3.id,
          text: "status changed to RESOLVED",
          actionType: ActionType.STATUS_CHANGE,
          previousStatus: TicketStatus.IN_PROGRESS,
          newStatus: TicketStatus.RESOLVED,
        },
        {
          userId: tech3.id,
          text: "Increased Nginx proxy timeout limit to 300 seconds and optimized SQL query index.",
          actionType: ActionType.COMMENT,
        },
      ],
    },
    {
      title: "Standing Desk Electric Motor Stuck",
      description: "Desk 12A motor stops at 32 inches and throws E04 error code.",
      status: TicketStatus.CLOSED,
      priority: TicketPriority.LOW,
      category: TicketCategory.FACILITIES,
      creatorId: emp1.id,
      assigneeId: tech2.id,
      activities: [
        {
          userId: emp1.id,
          text: "Submitted facilities ticket.",
          actionType: ActionType.STATUS_CHANGE,
          newStatus: TicketStatus.OPEN,
        },
        {
          userId: tech2.id,
          text: "status changed to RESOLVED",
          actionType: ActionType.STATUS_CHANGE,
          previousStatus: TicketStatus.IN_PROGRESS,
          newStatus: TicketStatus.RESOLVED,
        },
        {
          userId: emp1.id,
          text: "status changed to CLOSED",
          actionType: ActionType.STATUS_CHANGE,
          previousStatus: TicketStatus.RESOLVED,
          newStatus: TicketStatus.CLOSED,
        },
      ],
    },
    {
      title: "MacBook Pro Keyboard Replacement",
      description: "Spacebar key sticking on IT asset #MBP-2023-88.",
      status: TicketStatus.ASSIGNED,
      priority: TicketPriority.MEDIUM,
      category: TicketCategory.IT_SUPPORT,
      creatorId: emp3.id,
      assigneeId: tech2.id,
      activities: [
        {
          userId: emp3.id,
          text: "Submitted hardware repair request.",
          actionType: ActionType.STATUS_CHANGE,
          newStatus: TicketStatus.OPEN,
        },
        {
          userId: manager1.id,
          text: `assigned ticket to ${tech2.name}`,
          actionType: ActionType.ASSIGNMENT,
          newStatus: TicketStatus.ASSIGNED,
        },
      ],
    },
    {
      title: "Annual Benefit Portal 403 Forbidden Error",
      description: "Employees receiving 403 error when clicking Open Enrollment link in HR portal.",
      status: TicketStatus.OPEN,
      priority: TicketPriority.CRITICAL,
      category: TicketCategory.HR,
      creatorId: emp3.id,
      assigneeId: null,
      activities: [
        {
          userId: emp3.id,
          text: "Submitted critical HR portal ticket.",
          actionType: ActionType.STATUS_CHANGE,
          newStatus: TicketStatus.OPEN,
        },
      ],
    },
    {
      title: "Guest Wi-Fi Password Rotation Request",
      description: "Requesting monthly password update for Visitor-Guest SSID.",
      status: TicketStatus.CLOSED,
      priority: TicketPriority.LOW,
      category: TicketCategory.IT_SUPPORT,
      creatorId: emp1.id,
      assigneeId: tech1.id,
      activities: [
        {
          userId: emp1.id,
          text: "Submitted routine request.",
          actionType: ActionType.STATUS_CHANGE,
          newStatus: TicketStatus.OPEN,
        },
        {
          userId: tech1.id,
          text: "status changed to CLOSED",
          actionType: ActionType.STATUS_CHANGE,
          previousStatus: TicketStatus.RESOLVED,
          newStatus: TicketStatus.CLOSED,
        },
      ],
    },
    {
      title: "Ergonomic Chair Replacement for Marketing Office",
      description: "Lumbar support handle broken on office chair 08B.",
      status: TicketStatus.OPEN,
      priority: TicketPriority.LOW,
      category: TicketCategory.FACILITIES,
      creatorId: emp1.id,
      assigneeId: null,
      activities: [
        {
          userId: emp1.id,
          text: "Submitted request.",
          actionType: ActionType.STATUS_CHANGE,
          newStatus: TicketStatus.OPEN,
        },
      ],
    },
  ];

  for (const t of ticketsData) {
    const { activities, ...ticketData } = t;
    const createdTicket = await prisma.ticket.create({
      data: ticketData,
    });

    for (const act of activities) {
      await prisma.activity.create({
        data: {
          ticketId: createdTicket.id,
          userId: act.userId,
          text: act.text,
          actionType: act.actionType,
          previousStatus: act.previousStatus || null,
          newStatus: act.newStatus || null,
        },
      });
    }
  }

  console.log("🎉 Successfully seeded 15 tickets with full activity timelines!");
  console.log("\n🔑 Test Accounts Summary (Password: password123):");
  console.table([
    { Role: "MANAGER", Email: "manager1@company.com", Name: "Sarah Jenkins" },
    { Role: "MANAGER", Email: "manager2@company.com", Name: "David Ross" },
    { Role: "TECH", Email: "tech1@company.com", Name: "Alex Vance" },
    { Role: "TECH", Email: "tech2@company.com", Name: "Elena Rostova" },
    { Role: "TECH", Email: "tech3@company.com", Name: "Marcus Chen" },
    { Role: "EMPLOYEE", Email: "emp1@company.com", Name: "Emily Watson" },
    { Role: "EMPLOYEE", Email: "emp2@company.com", Name: "Jordan Lee" },
    { Role: "EMPLOYEE", Email: "emp3@company.com", Name: "Carlos Mendez" },
  ]);
}

main()
  .catch((e) => {
    console.error("❌ Seed Script Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
