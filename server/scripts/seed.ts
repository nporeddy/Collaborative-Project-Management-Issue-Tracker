/// <reference types="node" />
import "dotenv/config";
import bcrypt from "bcryptjs";
import { prisma } from "../src/lib/prisma.js";

const SAFETY_FLAG = process.env.SEED_CONFIRM;
const DB_URL = process.env.DATABASE_URL ?? "";

async function main() {
  if (SAFETY_FLAG !== "yes") {
    console.error(
      "\n❌ Safety check failed.\n\n" +
        "This script WIPES existing data. To run, set SEED_CONFIRM=yes.\n\n" +
        "  SEED_CONFIRM=yes npm run seed\n",
    );
    process.exit(1);
  }

  // Show which DB we're about to nuke
  const dbDisplay = DB_URL.replace(/:[^:@]+@/, ":***@"); // hide password
  console.log(`\n🌱 Seeding database:\n   ${dbDisplay}\n`);

  // ----------------------------------------------------------
  // 1. DESTRUCTIVE: clear existing data
  // ----------------------------------------------------------
  console.log("🗑️  Clearing existing data...");
  await prisma.comment.deleteMany();
  await prisma.label.deleteMany();
  await prisma.issue.deleteMany();
  await prisma.project.deleteMany();
  await prisma.membership.deleteMany();
  await prisma.workspace.deleteMany();
  await prisma.verificationToken.deleteMany();
  await prisma.pendingRegistration.deleteMany();
  await prisma.user.deleteMany();

  // ----------------------------------------------------------
  // 2. USERS (all pre-verified — bypassing the OTP flow)
  // ----------------------------------------------------------
  console.log("👤 Creating users...");
  const passwordHash = await bcrypt.hash("Demo12345", 10);
  const now = new Date();

  const [neha, priya, arjun, sara, demo] = await Promise.all([
    prisma.user.create({
      data: {
        email: "poreddynehareddy2002@gmail.com",
        name: "Neha Reddy",
        password: passwordHash,
        emailVerified: now,
      },
    }),
    prisma.user.create({
      data: {
        email: "poreddynehareddy2002+priya@gmail.com",
        name: "Priya Sharma",
        password: passwordHash,
        emailVerified: now,
      },
    }),
    prisma.user.create({
      data: {
        email: "poreddynehareddy2002+arjun@gmail.com",
        name: "Arjun Mehta",
        password: passwordHash,
        emailVerified: now,
      },
    }),
    prisma.user.create({
      data: {
        email: "poreddynehareddy2002+sara@gmail.com",
        name: "Sara Khan",
        password: passwordHash,
        emailVerified: now,
      },
    }),
    prisma.user.create({
      data: {
        email: "poreddynehareddy2002+demo@gmail.com",
        name: "Demo User",
        password: passwordHash,
        emailVerified: now,
      },
    }),
  ]);

  // ----------------------------------------------------------
  // 3. WORKSPACES + MEMBERSHIPS
  // ----------------------------------------------------------
  console.log("🏢 Creating workspaces...");

  const engineering = await prisma.workspace.create({
    data: {
      name: "Engineering Team",
      memberships: {
        create: [
          { userId: neha.id, role: "OWNER" },
          { userId: priya.id, role: "OWNER" },
          { userId: arjun.id, role: "MEMBER" },
          { userId: sara.id, role: "MEMBER" },
          { userId: demo.id, role: "MEMBER" },
        ],
      },
    },
  });

  const product = await prisma.workspace.create({
    data: {
      name: "Product Roadmap",
      memberships: {
        create: [
          { userId: neha.id, role: "OWNER" },
          { userId: priya.id, role: "ADMIN" },
          { userId: demo.id, role: "MEMBER" },
        ],
      },
    },
  });

  // ----------------------------------------------------------
  // 4. PROJECTS
  // ----------------------------------------------------------
  console.log("📁 Creating projects...");

  const webPlatform = await prisma.project.create({
    data: {
      name: "Web Platform",
      key: "WEB",
      workspaceId: engineering.id,
    },
  });
  const mobileApp = await prisma.project.create({
    data: {
      name: "Mobile App",
      key: "MOB",
      workspaceId: engineering.id,
    },
  });
  const infra = await prisma.project.create({
    data: {
      name: "Infrastructure",
      key: "INF",
      workspaceId: engineering.id,
    },
  });
  const roadmap2026 = await prisma.project.create({
    data: {
      name: "2026 Roadmap",
      key: "ROAD",
      workspaceId: product.id,
    },
  });

  // ----------------------------------------------------------
  // 5. ISSUES (Web Platform — the demo board)
  // ----------------------------------------------------------
  console.log("🎫 Creating issues...");

  const issues = [
    // TODO column — mix of assigned and unassigned
    {
      title: "Login fails on Safari iOS 17",
      status: "TODO",
      type: "BUG",
      priority: "HIGH",
      assigneeId: null,
    },
    {
      title: "Add password strength meter",
      status: "TODO",
      type: "STORY",
      priority: "MEDIUM",
      assigneeId: priya.id,
    },
    {
      title: "Update React Router to v7",
      status: "TODO",
      type: "TASK",
      priority: "LOW",
      assigneeId: null,
    },
    // IN_PROGRESS — all assigned
    {
      title: "OAuth integration with Google",
      status: "IN_PROGRESS",
      type: "STORY",
      priority: "HIGH",
      assigneeId: arjun.id,
    },
    {
      title: "Fix race condition in real-time sync",
      status: "IN_PROGRESS",
      type: "BUG",
      priority: "URGENT",
      assigneeId: neha.id,
    },
    {
      title: "Migrate Sentry to v8 SDK",
      status: "IN_PROGRESS",
      type: "TASK",
      priority: "MEDIUM",
      assigneeId: sara.id,
    },
    // IN_REVIEW
    {
      title: "Two-factor authentication",
      status: "IN_REVIEW",
      type: "STORY",
      priority: "HIGH",
      assigneeId: priya.id,
    },
    {
      title: "Database connection pooling",
      status: "IN_REVIEW",
      type: "TASK",
      priority: "MEDIUM",
      assigneeId: arjun.id,
    },
    // DONE
    {
      title: "Update Node to v20",
      status: "DONE",
      type: "TASK",
      priority: "MEDIUM",
      assigneeId: neha.id,
    },
    {
      title: "Fix memory leak in Socket.io reconnect",
      status: "DONE",
      type: "BUG",
      priority: "HIGH",
      assigneeId: arjun.id,
    },
    {
      title: "Add email verification flow",
      status: "DONE",
      type: "STORY",
      priority: "HIGH",
      assigneeId: neha.id,
    },
    {
      title: "Implement RBAC for workspaces",
      status: "DONE",
      type: "STORY",
      priority: "HIGH",
      assigneeId: priya.id,
    },
  ] as const;

  const createdIssues = await Promise.all(
    issues.map((i) =>
      prisma.issue.create({
        data: {
          title: i.title,
          status: i.status,
          type: i.type,
          priority: i.priority,
          projectId: webPlatform.id,
          assigneeId: i.assigneeId,
        },
      }),
    ),
  );

  // ----------------------------------------------------------
  // 6. COMMENTS on a few issues
  // ----------------------------------------------------------
  console.log("💬 Creating comments...");

  const oauthIssue = createdIssues.find((i) => i.title.includes("OAuth"));
  const safariIssue = createdIssues.find((i) => i.title.includes("Safari"));

  if (oauthIssue) {
    await prisma.comment.create({
      data: {
        issueId: oauthIssue.id,
        authorId: neha.id,
        body: "Started spike, will share findings tomorrow",
      },
    });
    await prisma.comment.create({
      data: {
        issueId: oauthIssue.id,
        authorId: priya.id,
        body: "Make sure we handle the existing-email-already-registered case",
      },
    });
    await prisma.comment.create({
      data: {
        issueId: oauthIssue.id,
        authorId: arjun.id,
        body: "Confirmed the redirect_uri works in dev, deploying to staging",
      },
    });
  }

  if (safariIssue) {
    await prisma.comment.create({
      data: {
        issueId: safariIssue.id,
        authorId: sara.id,
        body: "Reproduced on iPhone 14. Console shows CORS error.",
      },
    });
    await prisma.comment.create({
      data: {
        issueId: safariIssue.id,
        authorId: neha.id,
        body: "Looking into it — probably the cookie SameSite policy",
      },
    });
  }

  // ----------------------------------------------------------
  // SUMMARY
  // ----------------------------------------------------------
  console.log("\n✅ Seed complete!\n");
  console.log("   Demo credentials:");
  console.log("   Email:    poreddynehareddy2002+demo@gmail.com");
  console.log("   Password: Demo12345\n");
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error("❌ Seed failed:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
