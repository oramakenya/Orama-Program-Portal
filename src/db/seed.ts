import { db } from "./index";
import { users, instructors, parents, students, enrolments, attendance, grades, lessonPlans, paymentPlans, payments, chatMessages } from "./schema";
import { eq } from "drizzle-orm";

export async function seedDatabase() {
  try {
    // Check if seed has run by checking users table
    const existingUsers = await db.select().from(users).limit(1);
    if (existingUsers.length > 0) {
      console.log("Database already seeded.");
      return;
    }

    console.log("Seeding ORAMA Portal initial data...");

    // 1. Create Instructor Users
    const [instUser1] = await db.insert(users).values({
      username: "prof_emmanuel",
      name: "Prof. Emmanuel Mugisha",
      role: "instructor",
      email: "emmanuel.mugisha@orama.art",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80",
    }).returning();

    const [instUser2] = await db.insert(users).values({
      username: "maestro_clara",
      name: "Maestro Clara Ninsiima",
      role: "instructor",
      email: "clara.ninsiima@orama.art",
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=250&q=80",
    }).returning();

    const [instUser3] = await db.insert(users).values({
      username: "coach_julius",
      name: "Coach Julius Musoke",
      role: "instructor",
      email: "julius.musoke@orama.art",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=250&q=80",
    }).returning();

    // Insert Instructor Details
    const [inst1] = await db.insert(instructors).values({
      userId: instUser1.id,
      instructorCode: "INST-ART-01",
      discipline: "Visual Arts & Painting",
      bio: "Master of Fine Arts from Makerere University. Specializing in contemporary canvas painting and oil impressionism.",
      phone: "+256 772 123 456",
      officeHours: "Mon & Wed 3:00 PM - 6:00 PM",
    }).returning();

    const [inst2] = await db.insert(instructors).values({
      userId: instUser2.id,
      instructorCode: "INST-MUS-02",
      discipline: "Piano & Music Theory",
      bio: "Royal Schools of Music certified pianist and classical director with over 12 years of youth mentorship.",
      phone: "+256 701 987 654",
      officeHours: "Tue & Thu 2:00 PM - 5:30 PM",
    }).returning();

    const [inst3] = await db.insert(instructors).values({
      userId: instUser3.id,
      instructorCode: "INST-DRM-03",
      discipline: "Drama & Performing Arts",
      bio: "National Theatre Director and playwright specializing in youth ensemble, monologue delivery, and stage presence.",
      phone: "+256 782 555 123",
      officeHours: "Friday 1:00 PM - 5:00 PM",
    }).returning();

    // 2. Create Parent Users
    const [parentUser1] = await db.insert(users).values({
      username: "sakello",
      name: "Sarah Akello",
      role: "parent",
      email: "sarah.akello@gmail.com",
      avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=250&q=80",
    }).returning();

    const [parent1] = await db.insert(parents).values({
      userId: parentUser1.id,
      parentCode: "PAR-AKELLO-101",
      phone: "+256 752 443 210",
      address: "Kololo, Hill Drive, Kampala",
    }).returning();

    const [parentUser2] = await db.insert(users).values({
      username: "dochieng",
      name: "David Ochieng",
      role: "parent",
      email: "david.ochieng@gmail.com",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=250&q=80",
    }).returning();

    const [parent2] = await db.insert(parents).values({
      userId: parentUser2.id,
      parentCode: "PAR-OCHIENG-102",
      phone: "+256 774 889 900",
      address: "Naguru Avenue, Kampala",
    }).returning();

    // 3. Create Students
    // Parent 1 (Sarah Akello) has TWO students: Kiprah and Ethan
    const [student1] = await db.insert(students).values({
      parentId: parent1.id,
      studentCode: "ORM-2024-KIPRAH",
      fullName: "Kiprah Akello",
      age: 12,
      avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=250&q=80",
      gradeLevel: "Intermediate Level II",
      status: "Active",
    }).returning();

    const [student2] = await db.insert(students).values({
      parentId: parent1.id,
      studentCode: "ORM-2024-ETHAN",
      fullName: "Ethan Akello",
      age: 9,
      avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=250&q=80",
      gradeLevel: "Junior Level I",
      status: "Active",
    }).returning();

    // Parent 2 (David Ochieng) has Grace
    const [student3] = await db.insert(students).values({
      parentId: parent2.id,
      studentCode: "ORM-2024-GRACE",
      fullName: "Grace Ochieng",
      age: 14,
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=250&q=80",
      gradeLevel: "Advanced Masterclass",
      status: "Active",
    }).returning();

    // 4. Enrolments
    // Kiprah -> Piano (Inst Clara) & Painting (Inst Emmanuel)
    await db.insert(enrolments).values([
      {
        studentId: student1.id,
        instructorId: inst2.id,
        discipline: "Piano & Music Theory",
        schedule: "Tue & Thu 4:00 PM - 5:30 PM",
        term: "Term 1 - 2026",
      },
      {
        studentId: student1.id,
        instructorId: inst1.id,
        discipline: "Visual Arts & Painting",
        schedule: "Saturday 10:00 AM - 12:30 PM",
        term: "Term 1 - 2026",
      },
    ]);

    // Ethan -> Drama (Inst Julius)
    await db.insert(enrolments).values([
      {
        studentId: student2.id,
        instructorId: inst3.id,
        discipline: "Drama & Performing Arts",
        schedule: "Wed & Fri 3:30 PM - 5:00 PM",
        term: "Term 1 - 2026",
      },
    ]);

    // Grace -> Painting (Inst Emmanuel)
    await db.insert(enrolments).values([
      {
        studentId: student3.id,
        instructorId: inst1.id,
        discipline: "Visual Arts & Painting",
        schedule: "Saturday 1:30 PM - 4:00 PM",
        term: "Term 1 - 2026",
      },
    ]);

    // 5. Payment Plans
    await db.insert(paymentPlans).values([
      {
        parentId: parent1.id,
        studentId: student1.id,
        planName: "Termly Installment Plan",
        amountUgx: 650000,
        billingCycle: "Termly",
        status: "Active",
        nextDueDate: "2026-04-15",
      },
      {
        parentId: parent1.id,
        studentId: student2.id,
        planName: "Monthly Subscription Plan",
        amountUgx: 230000,
        billingCycle: "Monthly",
        status: "Active",
        nextDueDate: "2026-03-30",
      },
      {
        parentId: parent2.id,
        studentId: student3.id,
        planName: "Full Annual Pass",
        amountUgx: 1800000,
        billingCycle: "Annual",
        status: "Active",
        nextDueDate: "2026-12-01",
      },
    ]);

    // 6. Payment History
    await db.insert(payments).values([
      {
        parentId: parent1.id,
        studentId: student1.id,
        receiptNo: "ORM-REC-8841",
        amountUgx: 650000,
        feeUgx: 0,
        description: "Term 1 2026 Tuition - Piano & Visual Arts",
        paymentMethod: "MTN Mobile Money",
        status: "Completed",
        date: "2026-01-10",
      },
      {
        parentId: parent1.id,
        studentId: student2.id,
        receiptNo: "ORM-REC-8890",
        amountUgx: 230000,
        feeUgx: 0,
        description: "February 2026 Monthly Subscription - Drama",
        paymentMethod: "Airtel Money",
        status: "Completed",
        date: "2026-02-01",
      },
      {
        parentId: parent2.id,
        studentId: student3.id,
        receiptNo: "ORM-REC-7712",
        amountUgx: 1800000,
        feeUgx: 0,
        description: "Annual Tuition Pass 2026 - Visual Arts",
        paymentMethod: "Visa / Mastercard",
        status: "Completed",
        date: "2026-01-05",
      },
    ]);

    // 7. Attendance Records
    await db.insert(attendance).values([
      // Kiprah - Piano
      {
        studentId: student1.id,
        instructorId: inst2.id,
        discipline: "Piano & Music Theory",
        date: "2026-02-24",
        sessionTitle: "Polyrhythms & Chopin Scale Practice",
        status: "Present",
        notes: "Excellent posture and smooth hand crossover during Arpeggio drills.",
      },
      {
        studentId: student1.id,
        instructorId: inst2.id,
        discipline: "Piano & Music Theory",
        date: "2026-02-19",
        sessionTitle: "Sight Reading & Minor Keys",
        status: "Present",
        notes: "Quick comprehension of A-minor melodic scales.",
      },
      {
        studentId: student1.id,
        instructorId: inst2.id,
        discipline: "Piano & Music Theory",
        date: "2026-02-17",
        sessionTitle: "Sight Reading Intro",
        status: "Present",
        notes: "On time, well prepared.",
      },
      {
        studentId: student1.id,
        instructorId: inst2.id,
        discipline: "Piano & Music Theory",
        date: "2026-02-12",
        sessionTitle: "Pedal Work & Resonance",
        status: "Late",
        notes: "Arrived 10 mins late due to traffic, but completed pedal exercises.",
      },
      // Kiprah - Visual Arts
      {
        studentId: student1.id,
        instructorId: inst1.id,
        discipline: "Visual Arts & Painting",
        date: "2026-02-22",
        sessionTitle: "Acrylic Layering & Texture",
        status: "Present",
        notes: "Mastered palette knife mixing and light reflections.",
      },
      // Ethan - Drama
      {
        studentId: student2.id,
        instructorId: inst3.id,
        discipline: "Drama & Performing Arts",
        date: "2026-02-21",
        sessionTitle: "Character Voice Modulation & Stage Space",
        status: "Present",
        notes: "Ethan showed vibrant enthusiasm during the dialogue monologue.",
      },
      {
        studentId: student2.id,
        instructorId: inst3.id,
        discipline: "Drama & Performing Arts",
        date: "2026-02-18",
        sessionTitle: "Improv & Physical Expression",
        status: "Present",
        notes: "Great creative ideas during team improvs.",
      },
      // Grace - Visual Arts
      {
        studentId: student3.id,
        instructorId: inst1.id,
        discipline: "Visual Arts & Painting",
        date: "2026-02-22",
        sessionTitle: "Advanced Perspective & Portraiture",
        status: "Present",
        notes: "Grace's canvas composition demonstrated exceptional depth.",
      },
    ]);

    // 8. Grades / Evaluations
    await db.insert(grades).values([
      // Kiprah - Piano
      {
        studentId: student1.id,
        instructorId: inst2.id,
        discipline: "Piano & Music Theory",
        category: "Performance Recital",
        title: "Mid-Term Sonata Recital",
        score: 94,
        maxScore: 100,
        gradeLetter: "A+",
        remarks: "Superb execution of dynamics and finger independence. Keep practicing the crescendo in bar 32.",
        date: "2026-02-20",
      },
      {
        studentId: student1.id,
        instructorId: inst2.id,
        discipline: "Piano & Music Theory",
        category: "Theory Quiz",
        title: "Major & Minor Keys Assessment",
        score: 90,
        maxScore: 100,
        gradeLetter: "A",
        remarks: "Solid grasp of key signatures up to 4 sharps.",
        date: "2026-02-10",
      },
      // Kiprah - Visual Arts
      {
        studentId: student1.id,
        instructorId: inst1.id,
        discipline: "Visual Arts & Painting",
        category: "Canvas Project",
        title: "Expressionist Landscape Canvas",
        score: 91,
        maxScore: 100,
        gradeLetter: "A",
        remarks: "Rich color harmonies with bold brush strokes. Impressive balance of background contrast.",
        date: "2026-02-15",
      },
      // Ethan - Drama
      {
        studentId: student2.id,
        instructorId: inst3.id,
        discipline: "Drama & Performing Arts",
        category: "Monologue Presentation",
        title: "Shakespearean Youth Monologue",
        score: 88,
        maxScore: 100,
        gradeLetter: "A-",
        remarks: "Great voice projection and emotional delivery! Work on pauses before key turning points.",
        date: "2026-02-18",
      },
      // Grace - Visual Arts
      {
        studentId: student3.id,
        instructorId: inst1.id,
        discipline: "Visual Arts & Painting",
        category: "Gallery Critique",
        title: "Oil Glazing & Portraiture",
        score: 97,
        maxScore: 100,
        gradeLetter: "A+",
        remarks: "Outstanding realism and subtle shadow tones. Selected for the ORAMA Spring Exhibition!",
        date: "2026-02-21",
      },
    ]);

    // 9. Lesson Plans
    await db.insert(lessonPlans).values([
      // Art Instructor Emmanuel
      {
        instructorId: inst1.id,
        discipline: "Visual Arts & Painting",
        weekNumber: 5,
        title: "Color Theory & Impasto Painting Techniques",
        objectives: "Students will explore heavy body acrylic application, palette knife sculpting, and warm vs cool color balance.",
        materialsNeeded: "Stretched Canvas 16x20, Heavy Body Acrylics (Ultramarine, Cadmium Yellow, Burnt Sienna), Palette Knives, Gesso.",
        practiceAssignment: "Complete a 10x12 study of a sunrise applying impasto textures with palette knives only.",
        status: "Published",
        dateSchedule: "Feb 28 - Mar 02, 2026",
      },
      {
        instructorId: inst1.id,
        discipline: "Visual Arts & Painting",
        weekNumber: 6,
        title: "Perspective & Spatial Depth in Cityscapes",
        objectives: "Master 2-point perspective guidelines and vanishing points for urban landscape sketches.",
        materialsNeeded: "Graphite Pencils 2B-6B, T-Square ruler, Drawing Pad 300gsm.",
        practiceAssignment: "Sketch a 2-point perspective view of Kampala street architecture.",
        status: "Published",
        dateSchedule: "Mar 07 - Mar 09, 2026",
      },
      // Piano Instructor Clara
      {
        instructorId: inst2.id,
        discipline: "Piano & Music Theory",
        weekNumber: 5,
        title: "Chopin Prelude in E-Minor & Expressive Pedaling",
        objectives: "Develop soft pedal nuances, legato chord transitions, and expressive tempo rubato.",
        materialsNeeded: "Grand/Upright Piano, Sheet Music Op. 28 No. 4, Metronome.",
        practiceAssignment: "Practice left-hand harmonic shifts at 60 bpm with even dynamic control.",
        status: "Published",
        dateSchedule: "Feb 27 - Mar 01, 2026",
      },
      // Drama Instructor Julius
      {
        instructorId: inst3.id,
        discipline: "Drama & Performing Arts",
        weekNumber: 5,
        title: "Diaphragmatic Breathing & Spatial Blocking",
        objectives: "Enhance vocal resonance without strain and understand stage positioning relative to audience lighting.",
        materialsNeeded: "Script Copies (The African Storyteller), Comfortable Stage Attire.",
        practiceAssignment: "Memorize 12 lines of monologue with clear vocal emphasis and facial gestures.",
        status: "Published",
        dateSchedule: "Feb 26 - Feb 28, 2026",
      },
    ]);

    // 10. Chat Messages
    await db.insert(chatMessages).values([
      // Chat between Sarah Akello (parent) & Maestro Clara (music instructor) for Kiprah
      {
        parentId: parent1.id,
        instructorId: inst2.id,
        studentId: student1.id,
        senderRole: "instructor",
        senderName: "Maestro Clara Ninsiima",
        message: "Hello Mrs. Akello! Kiprah did fantastic in today's piano session. Her rhythm in the new prelude has improved tremendously.",
        isRead: true,
        createdAt: new Date(Date.now() - 3600000 * 48),
      },
      {
        parentId: parent1.id,
        instructorId: inst2.id,
        studentId: student1.id,
        senderRole: "parent",
        senderName: "Sarah Akello",
        message: "Thank you so much Maestro Clara! She has been practicing at home every evening after dinner. Should we purchase the Grade 3 Chopin scorebook now?",
        isRead: true,
        createdAt: new Date(Date.now() - 3600000 * 24),
      },
      {
        parentId: parent1.id,
        instructorId: inst2.id,
        studentId: student1.id,
        senderRole: "instructor",
        senderName: "Maestro Clara Ninsiima",
        message: "Yes, exactly! Grade 3 Book B will be perfect. We will start lesson 4 from it next Tuesday.",
        isRead: true,
        createdAt: new Date(Date.now() - 3600000 * 12),
      },
      // Chat between Sarah Akello & Emmanuel Mugisha (Art instructor) for Kiprah
      {
        parentId: parent1.id,
        instructorId: inst1.id,
        studentId: student1.id,
        senderRole: "instructor",
        senderName: "Prof. Emmanuel Mugisha",
        message: "Good day Sarah! Just letting you know Kiprah's landscape canvas is selected for display at the end-of-term ORAMA Arts Gala!",
        isRead: true,
        createdAt: new Date(Date.now() - 3600000 * 36),
      },
      {
        parentId: parent1.id,
        instructorId: inst1.id,
        studentId: student1.id,
        senderRole: "parent",
        senderName: "Sarah Akello",
        message: "That is wonderful news Prof. Emmanuel! We are so proud of her. What time will the exhibition open?",
        isRead: true,
        createdAt: new Date(Date.now() - 3600000 * 18),
      },
      // Chat between Sarah Akello & Julius Musoke (Drama instructor) for Ethan
      {
        parentId: parent1.id,
        instructorId: inst3.id,
        studentId: student2.id,
        senderRole: "instructor",
        senderName: "Coach Julius Musoke",
        message: "Hi Sarah! Ethan was brilliant in drama group rehearsal today. He picked up his character monologue effortlessly.",
        isRead: true,
        createdAt: new Date(Date.now() - 3600000 * 10),
      },
    ]);

    console.log("Database successfully seeded!");
  } catch (error) {
    console.error("Error seeding database:", error);
  }
}
