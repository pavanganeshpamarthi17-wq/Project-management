const User = require('../models/User');
const Project = require('../models/Project');
const Task = require('../models/Task');

const seedData = async () => {
  try {
    const userCount = await User.countDocuments();
    if (userCount > 0) {
      console.log('ℹ️ Database already contains data. Skipping seeding.');
      return;
    }

    console.log('🌱 Seeding database...');

    // 1. Create Users
    const demoUser = await User.create({
      name: 'Demo User',
      email: 'demo@projectflow.app',
      password: 'demo123456',
      role: 'admin',
      bio: 'Lead Project Manager at ProjectFlow. Keeping projects structured and running smoothly.',
      avatar: ''
    });

    const alice = await User.create({
      name: 'Alice Smith',
      email: 'alice@projectflow.app',
      password: 'alice123456',
      role: 'member',
      bio: 'Senior UI/UX Designer and Frontend Engineer.',
      avatar: ''
    });

    const bob = await User.create({
      name: 'Bob Johnson',
      email: 'bob@projectflow.app',
      password: 'bob123456',
      role: 'member',
      bio: 'Backend & DevOps Engineer.',
      avatar: ''
    });

    console.log('✅ Users seeded');

    // Helper dates
    const dateAgo = (days) => {
      const d = new Date();
      d.setDate(d.getDate() - days);
      return d;
    };
    const dateAhead = (days) => {
      const d = new Date();
      d.setDate(d.getDate() + days);
      return d;
    };

    // 2. Create Projects
    const project1 = await Project.create({
      title: 'Acme Website Redesign',
      description: 'Overhaul the primary public marketing site for Acme Corp. Migrate to React, improve SEO performance, and establish a new modern design system.',
      owner: demoUser._id,
      members: [alice._id, bob._id],
      status: 'active',
      priority: 'high',
      dueDate: dateAhead(7),
      color: '#6366f1' // Indigo
    });

    const project2 = await Project.create({
      title: 'Mobile App MVP',
      description: 'Develop a cross-platform Flutter/React Native application prototype to validate product core assumptions with beta testers.',
      owner: demoUser._id,
      members: [alice._id],
      status: 'active',
      priority: 'medium',
      dueDate: dateAhead(14),
      color: '#10b981' // Emerald
    });

    const project3 = await Project.create({
      title: 'Q3 Marketing Campaign',
      description: 'Plan, design, and launch marketing outreach for the new enterprise tier releases, including newsletter campaigns and social media collateral.',
      owner: demoUser._id,
      members: [bob._id],
      status: 'on-hold',
      priority: 'low',
      dueDate: dateAhead(30),
      color: '#f59e0b' // Amber
    });

    console.log('✅ Projects seeded');

    // 3. Create Tasks
    // -- Project 1 (Acme Website Redesign)
    const task1_1 = await Task.create({
      title: 'Design homepage wireframes & styling guidelines',
      description: 'Create high-fidelity Figma mockups for desktop and mobile layouts, specifying typography scales, margins, and custom components.',
      projectId: project1._id,
      assignedTo: alice._id,
      createdBy: demoUser._id,
      priority: 'high',
      status: 'completed',
      dueDate: dateAgo(3),
      tags: ['Design', 'Figma', 'v2'],
      comments: [
        { user: alice._id, text: 'The Figma prototype is now locked. Ready for backend implementation alignment.' },
        { user: demoUser._id, text: 'Looks clean! Love the dark mode palette.' }
      ]
    });

    const task1_2 = await Task.create({
      title: 'Set up React + Vite boilerplate and styling rules',
      description: 'Configure standard linting rules, folder structures, path aliases, CSS modules variables, and base components (Buttons, Inputs, Modals).',
      projectId: project1._id,
      assignedTo: demoUser._id,
      createdBy: demoUser._id,
      priority: 'medium',
      status: 'completed',
      dueDate: dateAgo(1),
      tags: ['Frontend', 'Vite']
    });

    const task1_3 = await Task.create({
      title: 'Implement authentication flows & JWT route guards',
      description: 'Write frontend Login/Register forms with complete client validation, React context auth provider, and backend middleware endpoint verification.',
      projectId: project1._id,
      assignedTo: demoUser._id,
      createdBy: demoUser._id,
      priority: 'high',
      status: 'in-progress',
      dueDate: dateAhead(2),
      tags: ['Security', 'Auth', 'Backend'],
      comments: [
        { user: alice._id, text: 'I am finishing up the styled layouts for both the login page and profile page. I will check in my branch shortly.' },
        { user: demoUser._id, text: 'Perfect, let me know when it is merged so I can test integration with the JWT endpoints!' }
      ]
    });

    const task1_4 = await Task.create({
      title: 'Write frontend integration and unit tests',
      description: 'Ensure critical paths (Auth, project creation, dashboard cards) are fully tested using React Testing Library or Vitest.',
      projectId: project1._id,
      assignedTo: alice._id,
      createdBy: demoUser._id,
      priority: 'medium',
      status: 'todo',
      dueDate: dateAhead(5),
      tags: ['Testing', 'QA']
    });

    const task1_5 = await Task.create({
      title: 'Deploy staging environment on Netlify + Render',
      description: 'Configure continuous integration pipelines to automatically build and deploy production packages upon main branch merges.',
      projectId: project1._id,
      assignedTo: bob._id,
      createdBy: demoUser._id,
      priority: 'high',
      status: 'todo',
      dueDate: dateAhead(7),
      tags: ['DevOps', 'CI/CD']
    });

    const task1_6 = await Task.create({
      title: 'Optimize public images and SEO metadata',
      description: 'Convert assets to next-gen formats (WebP), set up open graph meta tags, descriptive title formats, and prepare a sitemap xml compiler.',
      projectId: project1._id,
      assignedTo: null,
      createdBy: demoUser._id,
      priority: 'low',
      status: 'todo',
      dueDate: dateAhead(10),
      tags: ['SEO', 'Performance']
    });

    // -- Project 2 (Mobile App MVP)
    const task2_1 = await Task.create({
      title: 'Define product requirements document (PRD)',
      description: 'Identify core scope constraints, outline primary target audience personas, and draft wireframe mockups for key screen transitions.',
      projectId: project2._id,
      assignedTo: demoUser._id,
      createdBy: demoUser._id,
      priority: 'high',
      status: 'completed',
      dueDate: dateAgo(5),
      tags: ['Specs', 'Planning']
    });

    const task2_2 = await Task.create({
      title: 'Create database schemas and API specifications',
      description: 'Formulate relational models for projects, workspaces, and team memberships, detailing endpoints, payload objects, and query parameters.',
      projectId: project2._id,
      assignedTo: demoUser._id,
      createdBy: demoUser._id,
      priority: 'high',
      status: 'in-progress',
      dueDate: dateAhead(1),
      tags: ['Backend', 'DB']
    });

    const task2_3 = await Task.create({
      title: 'Build user profile UI screen',
      description: 'Design the profile editing grid, allowing users to upload custom avatar images, change passwords, and update bio summaries.',
      projectId: project2._id,
      assignedTo: alice._id,
      createdBy: demoUser._id,
      priority: 'medium',
      status: 'todo',
      dueDate: dateAhead(4),
      tags: ['Frontend', 'UI']
    });

    // -- Project 3 (Q3 Marketing Campaign)
    const task3_1 = await Task.create({
      title: 'Brainstorm social media content calendar',
      description: 'Outline key announcements, graphic sizes, newsletter topics, and scheduling rules across LinkedIn, Twitter, and dev blogs.',
      projectId: project3._id,
      assignedTo: bob._id,
      createdBy: demoUser._id,
      priority: 'medium',
      status: 'todo',
      dueDate: dateAhead(12),
      tags: ['Marketing', 'Planning']
    });

    console.log('✅ Tasks seeded');
    console.log('🎉 Database seeding complete!');
  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
  }
};

module.exports = seedData;
