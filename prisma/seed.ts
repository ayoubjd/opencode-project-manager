import { PrismaClient } from "../src/generated/prisma/client.js";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import Database from "better-sqlite3";
import { join } from "path";

const dbPath = join(process.cwd(), "dev.db");
const adapter = new PrismaBetterSqlite3({ url: `file:${dbPath}` });
const prisma = new PrismaClient({ adapter });

async function main() {
  const existingProjects = await prisma.project.count();
  if (existingProjects > 0) {
    console.log("Database already seeded. Skipping.");
    return;
  }

  const p1 = await prisma.project.create({
    data: { name: "Website Redesign", description: "Redesign the company website with modern UI/UX", createdAt: new Date("2026-01-15") },
  });
  const p2 = await prisma.project.create({
    data: { name: "Mobile App v2", description: "Version 2 of the mobile application with new features", createdAt: new Date("2026-02-01") },
  });
  const p3 = await prisma.project.create({
    data: { name: "API Gateway", description: "Build a unified API gateway for microservices", createdAt: new Date("2026-03-10") },
  });
  const p4 = await prisma.project.create({
    data: { name: "Data Pipeline", description: "Real-time data processing pipeline infrastructure", createdAt: new Date("2026-04-20") },
  });

  await prisma.task.createMany({
    data: [
      { projectId: p1.id, title: "Design homepage mockup", description: "Create Figma mockups for the new homepage layout", status: "done", priority: "high", assignee: "Alice", dueDate: new Date("2026-02-01"), order: 0, createdAt: new Date("2026-01-16") },
      { projectId: p1.id, title: "Implement responsive header", description: "Build a responsive navigation header component", status: "in-progress", priority: "medium", assignee: "Bob", dueDate: new Date("2026-03-01"), order: 0, createdAt: new Date("2026-01-20") },
      { projectId: p1.id, title: "Set up CI/CD pipeline", description: "Configure GitHub Actions for automatic deployment", status: "todo", priority: "low", assignee: "Charlie", dueDate: null, order: 0, createdAt: new Date("2026-02-01") },
      { projectId: p2.id, title: "User authentication flow", description: "Implement OAuth2 login with Google and GitHub", status: "in-progress", priority: "urgent", assignee: "Alice", dueDate: new Date("2026-03-15"), order: 0, createdAt: new Date("2026-02-05") },
      { projectId: p2.id, title: "Push notifications", description: "Integrate push notification service", status: "todo", priority: "medium", assignee: "Bob", dueDate: null, order: 1, createdAt: new Date("2026-02-10") },
      { projectId: p2.id, title: "Dark mode support", description: "Add dark mode theme toggle and styles", status: "todo", priority: "low", assignee: "Diana", dueDate: null, order: 2, createdAt: new Date("2026-02-15") },
      { projectId: p3.id, title: "Rate limiting middleware", description: "Implement rate limiting for API endpoints", status: "done", priority: "high", assignee: "Charlie", dueDate: new Date("2026-04-01"), order: 0, createdAt: new Date("2026-03-12") },
      { projectId: p3.id, title: "API documentation", description: "Write OpenAPI/Swagger documentation", status: "in-progress", priority: "medium", assignee: "Diana", dueDate: new Date("2026-04-15"), order: 0, createdAt: new Date("2026-03-15") },
      { projectId: p3.id, title: "Load testing", description: "Run load tests and optimize performance", status: "todo", priority: "high", assignee: "Bob", dueDate: new Date("2026-05-01"), order: 0, createdAt: new Date("2026-03-20") },
      { projectId: p4.id, title: "Kafka consumer setup", description: "Set up Kafka consumer group for data ingestion", status: "in-progress", priority: "high", assignee: "Charlie", dueDate: null, order: 0, createdAt: new Date("2026-04-22") },
      { projectId: p4.id, title: "Data warehouse schema", description: "Design and implement data warehouse schema", status: "todo", priority: "medium", assignee: "Diana", dueDate: null, order: 1, createdAt: new Date("2026-04-25") },
      { projectId: p4.id, title: "Monitoring dashboard", description: "Build Grafana dashboards for pipeline monitoring", status: "todo", priority: "low", assignee: "Alice", dueDate: null, order: 2, createdAt: new Date("2026-04-28") },
    ],
  });

  console.log("Database seeded successfully.");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
