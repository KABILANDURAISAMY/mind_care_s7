/**
 * MindCare Q/A Wellness Info Dataset
 * Contains the exact 10 categories with 15 specific questions each as requested (Total: 150 Q/A items)
 * Informational, educational, non-judgmental answers free of chatbot UI or AI typing.
 */

const categories = [
  "Exam / Academic Stress",
  "Anxiety",
  "Fear",
  "Career / Future Stress",
  "Financial Stress",
  "Relationship / Social Stress",
  "Loneliness",
  "Family / Expectation Pressure",
  "Sleep / Rest Problems",
  "General Stress"
];

const categoryDescriptions = {
  "Exam / Academic Stress": "Information about handling examination pressure, workload, study stress, and academic expectations.",
  "Anxiety": "Information about understanding and managing common anxiety-related experiences.",
  "Fear": "Information about navigating fear of failure, evaluation, public speaking, and building confidence.",
  "Career / Future Stress": "Information about career choices, placement pressure, job searching, and future planning.",
  "Financial Stress": "Information about managing student budgets, educational expenses, and financial worries.",
  "Relationship / Social Stress": "Information about resolving friendship conflicts, peer pressure, and setting healthy boundaries.",
  "Loneliness": "Information about overcoming social isolation in college, making friends, and building connection.",
  "Family / Expectation Pressure": "Information about managing family expectations, academic pressure, and communicating with parents.",
  "Sleep / Rest Problems": "Information about sleep routines, exam-related rest issues, and healthy sleep hygiene.",
  "General Stress": "Information about understanding stress, relaxation techniques, and practical daily coping methods."
};

const wellnessQAData = [
  // ==========================================
  // 1. EXAM / ACADEMIC STRESS (15 Items)
  // ==========================================
  {
    category: "Exam / Academic Stress",
    question: "Why do I feel stressed before exams?",
    answer: "Feeling stressed before an exam is common because exams can create pressure about preparation, performance, and results. Breaking your study work into smaller tasks, taking short breaks, maintaining a regular routine, and focusing on what you can control can make the situation easier to manage.",
    advice: "Focus on task-by-task preparation rather than worrying about the total outcome.",
    order: 1,
    active: true
  },
  {
    category: "Exam / Academic Stress",
    question: "How can I stay calm when I have too much to study?",
    answer: "When faced with a heavy syllabus, prioritize topics by importance and break study material into short, structured blocks. Trying to learn everything at once increases anxiety. Taking regular five-minute breaks keeps your mind focused.",
    advice: "Use study sessions of 25-30 minutes followed by brief rest breaks to maintain steady focus.",
    order: 2,
    active: true
  },
  {
    category: "Exam / Academic Stress",
    question: "What should I do when I cannot concentrate on my studies?",
    answer: "Difficulty concentrating often happens due to fatigue, digital distractions, or mental overload. Step away from your desk, stretch, drink water, and remove phone notifications before starting again.",
    advice: "Try active studying techniques like writing summary notes or testing yourself to keep your brain engaged.",
    order: 3,
    active: true
  },
  {
    category: "Exam / Academic Stress",
    question: "How can I manage exam pressure effectively?",
    answer: "Manage exam pressure by maintaining a realistic daily timetable that includes adequate sleep, meals, and revision. Avoid last-minute cramming, as it increases stress and reduces recall.",
    advice: "Keep a steady study pace in the days leading up to exams rather than pulling all-nighters.",
    order: 4,
    active: true
  },
  {
    category: "Exam / Academic Stress",
    question: "Why do I feel nervous even when I have prepared well?",
    answer: "Pre-exam nervousness is a biological reaction to wanting to do well. The body releases adrenaline, which can feel like fear. Remind yourself that nervousness is normal and that your preparation will support you.",
    advice: "Take a few slow, deep exhalations before starting your exam paper to calm physical tension.",
    order: 5,
    active: true
  },
  {
    category: "Exam / Academic Stress",
    question: "How can I stop overthinking about exam results?",
    answer: "Overthinking occurs when we focus heavily on future outcomes outside our immediate control. Shift your energy toward controllable actions like reviewing key concepts or solving sample papers.",
    advice: "Once an exam is over, intentionally transition to a restful activity rather than re-analyzing answers.",
    order: 6,
    active: true
  },
  {
    category: "Exam / Academic Stress",
    question: "What can I do when I feel like I am not good enough academically?",
    answer: "Academic self-doubt often comes from comparing yourself to others or setting perfectionist standards. Recognize your personal growth and remember that academic performance does not define your entire self-worth.",
    advice: "Focus on your individual progress and celebrate small learning milestones.",
    order: 7,
    active: true
  },
  {
    category: "Exam / Academic Stress",
    question: "How can I create a study routine without feeling overwhelmed?",
    answer: "Build a flexible timetable that aligns with your peak energy hours. Allocate realistic time for each subject, and ensure you include downtime for rest and meals.",
    advice: "Start with a 1-week schedule and adjust it based on what feels manageable.",
    order: 8,
    active: true
  },
  {
    category: "Exam / Academic Stress",
    question: "What should I do if I keep comparing my marks with others?",
    answer: "Every student has different learning styles, background preparation, and strengths. Comparing marks increases anxiety without adding value to your own learning. Focus on improving your personal understanding.",
    advice: "Redirect your attention to your own study goals whenever you catch yourself comparing with peers.",
    order: 9,
    active: true
  },
  {
    category: "Exam / Academic Stress",
    question: "How can I handle fear of failure in exams?",
    answer: "Fear of failure can be managed by viewing tests as progress checks rather than final judgments. Making mistakes in practice is part of learning and helps identify areas for improvement.",
    advice: "Treat practice tests as learning opportunities to catch errors early.",
    order: 10,
    active: true
  },
  {
    category: "Exam / Academic Stress",
    question: "What should I do when I lose motivation to study?",
    answer: "Motivation naturally rises and falls. When feeling unmotivated, lower the barrier to entry by committing to study for just 10 minutes. Often, taking the first step creates momentum.",
    advice: "Start with easier or more interesting topics to rebuild your study rhythm.",
    order: 11,
    active: true
  },
  {
    category: "Exam / Academic Stress",
    question: "How can I take breaks without feeling guilty?",
    answer: "Rest breaks are necessary for memory consolidation and preventing burnout. Taking scheduled breaks actually improves your total productivity and mental clarity.",
    advice: "View rest as an essential component of effective study, not a waste of time.",
    order: 12,
    active: true
  },
  {
    category: "Exam / Academic Stress",
    question: "What can I do when academic pressure affects my mood?",
    answer: "When study pressure makes you feel irritable or down, step away to engage in non-academic activities such as physical movement, listening to calming music, or talking to a friend.",
    advice: "Balance intense study sessions with pleasant daily activities to protect your emotional well-being.",
    order: 13,
    active: true
  },
  {
    category: "Exam / Academic Stress",
    question: "How can I balance studies and personal life?",
    answer: "Set clear boundaries between study hours and personal time. When your planned study period ends, step away from textbooks and engage fully in hobbies, family time, or relaxation.",
    advice: "Treat personal downtime with the same respect as scheduled classes.",
    order: 14,
    active: true
  },
  {
    category: "Exam / Academic Stress",
    question: "When should I talk to someone about academic stress?",
    answer: "If academic stress consistently causes sleep problems, severe anxiety, persistent low mood, or inability to focus for more than two weeks, speaking with a campus counselor can provide tailored support.",
    advice: "MindCare counselors are available to help you develop healthy coping strategies.",
    order: 15,
    active: true
  },

  // ==========================================
  // 2. ANXIETY (15 Items)
  // ==========================================
  {
    category: "Anxiety",
    question: "Why do I feel anxious without knowing the exact reason?",
    answer: "Anxiety can occur even without a single clear trigger due to accumulated daily stress, lack of sleep, or hormonal fluctuations. Acknowledging the feeling without panicking helps it pass naturally.",
    advice: "Practice slow breathing and focus on physical grounding when unexplained anxiety arises.",
    order: 1,
    active: true
  },
  {
    category: "Anxiety",
    question: "What can I do when I suddenly feel anxious?",
    answer: "Pause what you are doing, sit comfortably, and place your feet flat on the ground. Focus on taking slow exhalations to help your body lower physical tension.",
    advice: "Focus on 5 things you can see and 4 things you can feel right now.",
    order: 2,
    active: true
  },
  {
    category: "Anxiety",
    question: "How can I calm my mind when I overthink?",
    answer: "Overthinking happens when the brain attempts to control unpredicted situations. Write your concerns down on paper to separate yourself from the thoughts, then focus on an immediate task.",
    advice: "Setting a 10-minute 'worry time' helps keep overthinking from filling your entire day.",
    order: 3,
    active: true
  },
  {
    category: "Anxiety",
    question: "Why does anxiety make it difficult to concentrate?",
    answer: "When anxious, your brain prioritizes scanning for perceived worries, leaving less cognitive energy for reading or studying. Calming your body helps restore mental focus.",
    advice: "Engage in brief physical movement or breathing before attempting to focus.",
    order: 4,
    active: true
  },
  {
    category: "Anxiety",
    question: "How can I manage anxiety before an important event?",
    answer: "Prepare thoroughly beforehand and establish a predictable routine on the day of the event. Avoid excessive caffeine, arrive slightly early, and practice quiet slow breathing.",
    advice: "Focus on your preparation and immediate steps rather than imagining bad outcomes.",
    order: 5,
    active: true
  },
  {
    category: "Anxiety",
    question: "What breathing techniques can help me feel calmer?",
    answer: "Box breathing is very effective: inhale through your nose for 4 seconds, hold for 4 seconds, exhale through your mouth for 4 seconds, and hold empty for 4 seconds.",
    advice: "Repeat the 4-second box breathing cycle 3 to 4 times to settle your nervous system.",
    order: 6,
    active: true
  },
  {
    category: "Anxiety",
    question: "How can I stop worrying about things I cannot control?",
    answer: "Draw a circle and write down things you can control inside (your efforts, routine, reaction) and things outside (other people's actions, future outcomes) outside the circle. Focus your energy inside.",
    advice: "Direct your effort strictly to factors within your personal control.",
    order: 7,
    active: true
  },
  {
    category: "Anxiety",
    question: "What should I do when my thoughts keep repeating?",
    answer: "Interrupt repetitive thoughts by changing your physical activity: take a brisk walk, wash your face with cool water, or switch to a structured hands-on task.",
    advice: "Physical movement helps break repetitive thought loops.",
    order: 8,
    active: true
  },
  {
    category: "Anxiety",
    question: "How can I manage anxiety during college life?",
    answer: "College life brings new responsibilities. Building predictable daily routines for sleep, food, study, and social interaction creates stability and lowers baseline anxiety.",
    advice: "Maintain a steady daily routine to create predictability.",
    order: 9,
    active: true
  },
  {
    category: "Anxiety",
    question: "Why do I sometimes expect the worst to happen?",
    answer: "Expecting the worst (catastrophizing) is a protective mind habit that tries to prevent surprise. Counter it by asking yourself: 'What is the most likely, realistic outcome?'",
    advice: "Balance negative thoughts by identifying realistic, neutral scenarios.",
    order: 10,
    active: true
  },
  {
    category: "Anxiety",
    question: "How can I build confidence when anxiety holds me back?",
    answer: "Take small, incremental steps toward challenges rather than avoiding them entirely. Every small accomplishment reinforces your self-confidence.",
    advice: "Celebrate minor victories to build long-term confidence.",
    order: 11,
    active: true
  },
  {
    category: "Anxiety",
    question: "What daily habits can help reduce stress and anxiety?",
    answer: "Regular physical activity, consistent sleep, limiting caffeine, spending time outdoors, and maintaining supportive friendships reduce daily anxiety.",
    advice: "Small, healthy daily routines accumulate into strong emotional resilience.",
    order: 12,
    active: true
  },
  {
    category: "Anxiety",
    question: "How can I handle anxiety when speaking in front of others?",
    answer: "Rehearse your presentation in advance. When speaking, look at friendly faces in the audience, speak at a measured pace, and remember that audiences want you to succeed.",
    advice: "Pause and take a deep breath before you begin your presentation.",
    order: 13,
    active: true
  },
  {
    category: "Anxiety",
    question: "What should I do if anxiety is affecting my daily activities?",
    answer: "If anxiety interferes with eating, sleeping, attending classes, or studying, talk to a qualified counselor to learn personalized coping tools.",
    advice: "Early support helps manage anxiety effectively before it escalates.",
    order: 14,
    active: true
  },
  {
    category: "Anxiety",
    question: "When should I consider talking to a counselor about anxiety?",
    answer: "Consider speaking with a counselor if anxiety feels unmanageable, persists for several weeks, or prevents you from enjoying student life.",
    advice: "MindCare counselors offer confidential, professional support for students.",
    order: 15,
    active: true
  },

  // ==========================================
  // 3. FEAR (15 Items)
  // ==========================================
  {
    category: "Fear",
    question: "Why do I feel afraid of failing?",
    answer: "Fear of failure often arises from attaching personal worth exclusively to achievements. Remembering that setbacks are normal opportunities to learn reduces this fear.",
    advice: "View failure as constructive feedback on method, not personal worth.",
    order: 1,
    active: true
  },
  {
    category: "Fear",
    question: "How can I handle fear of making mistakes?",
    answer: "Accept that making mistakes is a natural part of acquiring new skills. Reframing errors as learning opportunities builds courage and resilience.",
    advice: "Focus on learning and growth rather than flawless perfection.",
    order: 2,
    active: true
  },
  {
    category: "Fear",
    question: "What can I do when fear stops me from trying something new?",
    answer: "Break the new challenge into tiny, low-pressure steps. Taking a very small initial step lowers fear and builds momentum.",
    advice: "Focus on taking just the first small action.",
    order: 3,
    active: true
  },
  {
    category: "Fear",
    question: "How can I manage fear before an exam or presentation?",
    answer: "Prepare systematically, practice your material out loud, and focus on delivering your message clearly rather than worrying about perfection.",
    advice: "Arrive slightly early and take slow breaths to settle pre-performance fear.",
    order: 4,
    active: true
  },
  {
    category: "Fear",
    question: "Why do I worry so much about what others think of me?",
    answer: "Worrying about others' opinions is a common human concern. Most people are absorbed in their own responsibilities. Focus on acting according to your own values.",
    advice: "Prioritize your personal growth over seeking constant external approval.",
    order: 5,
    active: true
  },
  {
    category: "Fear",
    question: "How can I become more comfortable with uncertainty?",
    answer: "Uncertainty is a normal part of life. Build comfort by focusing on your adaptability and preparation rather than demanding complete advance certainty.",
    advice: "Remind yourself of past uncertain situations you managed successfully.",
    order: 6,
    active: true
  },
  {
    category: "Fear",
    question: "What can I do when I am afraid of disappointing others?",
    answer: "Communicate openly about your efforts and realistic limits. Caring family and friends value your health and honest effort above flawless outcomes.",
    advice: "Share your realistic plans and limits openly with loved ones.",
    order: 7,
    active: true
  },
  {
    category: "Fear",
    question: "How can I deal with fear of the future?",
    answer: "The future is built through present daily choices. Shift your focus to what you can accomplish today, such as completing coursework or learning a skill.",
    advice: "Focus on present actionable steps to build a secure future.",
    order: 8,
    active: true
  },
  {
    category: "Fear",
    question: "Why does fear sometimes make me avoid important tasks?",
    answer: "Avoidance is a temporary defense against uncomfortable feelings. However, avoiding tasks increases stress later. Starting with just five minutes of work breaks the avoidance loop.",
    advice: "Commit to working on the task for just 5 minutes to overcome avoidance.",
    order: 9,
    active: true
  },
  {
    category: "Fear",
    question: "How can I build courage to face difficult situations?",
    answer: "Courage is taking action despite feeling afraid. Acknowledge your fear, prepare what you can, and take gradual steps forward.",
    advice: "Take small, intentional steps toward your goals despite fear.",
    order: 10,
    active: true
  },
  {
    category: "Fear",
    question: "What can I do when I feel afraid of making decisions?",
    answer: "Gather basic facts, weigh realistic options, and remember that most decisions can be adapted as you learn more. Avoid over-analyzing minor details.",
    advice: "Set a clear deadline for making decisions to prevent endless deliberation.",
    order: 11,
    active: true
  },
  {
    category: "Fear",
    question: "How can I stop imagining negative outcomes?",
    answer: "When your mind generates negative scenarios, consciously ask: 'What positive or neutral outcomes are also possible?' Practice balanced thinking.",
    advice: "Challenge negative assumptions with realistic facts.",
    order: 12,
    active: true
  },
  {
    category: "Fear",
    question: "How can I handle fear of being judged?",
    answer: "Remember that peer judgments are usually temporary and reflect their own perspectives. Focus on authentic relationships with people who accept you.",
    advice: "Build connections with supportive peers who respect you.",
    order: 13,
    active: true
  },
  {
    category: "Fear",
    question: "What should I do when fear affects my confidence?",
    answer: "Revisit past accomplishments and focus on skills you have successfully built. Self-confidence grows when you recognize your ongoing efforts.",
    advice: "Keep a record of your achievements and positive progress.",
    order: 14,
    active: true
  },
  {
    category: "Fear",
    question: "When should I seek support for persistent fear?",
    answer: "If fear consistently holds you back from classes, social activities, or daily goals, speaking with a campus counselor can provide practical strategies.",
    advice: "Campus counselors provide supportive guidance to help overcome fears.",
    order: 15,
    active: true
  },

  // ==========================================
  // 4. CAREER / FUTURE STRESS (15 Items)
  // ==========================================
  {
    category: "Career / Future Stress",
    question: "Why do I feel stressed about my career?",
    answer: "Career stress is common because choosing a direction feels like a major responsibility. Remind yourself that careers evolve through continuous learning and multiple opportunities over time.",
    advice: "Focus on developing strong foundational skills that apply across fields.",
    order: 1,
    active: true
  },
  {
    category: "Career / Future Stress",
    question: "What should I do if I am confused about my career choice?",
    answer: "Explore options by speaking with faculty, career advisors, and working professionals. Gaining practical exposure through short projects or internships helps clarify interests.",
    advice: "Schedule a guidance session with campus career services.",
    order: 2,
    active: true
  },
  {
    category: "Career / Future Stress",
    question: "How can I handle pressure to get a good job?",
    answer: "Break job preparation into daily manageable steps—such as refining your resume, practicing aptitude tests, or building projects—rather than focusing on outcome pressure.",
    advice: "Focus on consistent daily preparation rather than placement pressure.",
    order: 3,
    active: true
  },
  {
    category: "Career / Future Stress",
    question: "What can I do when I compare my career progress with others?",
    answer: "Everyone has a unique career timeline and set of opportunities. Comparing your starting phase to someone else's progress creates unneeded stress.",
    advice: "Keep your focus on your personal development journey.",
    order: 4,
    active: true
  },
  {
    category: "Career / Future Stress",
    question: "How can I manage placement-related stress?",
    answer: "Maintain a structured revision schedule, practice mock interviews, and ensure you get adequate sleep. Remember that campus placement is just one of many career entry points.",
    advice: "Balance placement prep with regular sleep and physical movement.",
    order: 5,
    active: true
  },
  {
    category: "Career / Future Stress",
    question: "What should I do if I feel behind my classmates?",
    answer: "Skill building happens at individual paces. Identify specific skills you want to upgrade and set achievable weekly goals to work on them.",
    advice: "Focus on your individual skill development step by step.",
    order: 6,
    active: true
  },
  {
    category: "Career / Future Stress",
    question: "How can I stay motivated when job searching takes time?",
    answer: "Job searching can be a lengthy process. Maintain daily routines, celebrate small milestones like completing applications or interviews, and stay connected with supportive peers.",
    advice: "Treat job searching like a regular structured daily activity.",
    order: 7,
    active: true
  },
  {
    category: "Career / Future Stress",
    question: "How can I handle uncertainty about my future?",
    answer: "Uncertainty is a natural part of career transitions. Build resilience by working on versatile communication, technical, and problem-solving skills.",
    advice: "Focus on acquiring transferable skills that remain valuable everywhere.",
    order: 8,
    active: true
  },
  {
    category: "Career / Future Stress",
    question: "What should I do when my family expects a specific career?",
    answer: "Have calm, well-informed conversations with your family. Present research on growth opportunities in your preferred domain to build mutual understanding.",
    advice: "Share structured information about your target field with family members.",
    order: 9,
    active: true
  },
  {
    category: "Career / Future Stress",
    question: "How can I make career decisions without overthinking?",
    answer: "Gather reliable information, consult trusted advisors, evaluate your options against your strengths, and choose a path. Decisions can always be refined later.",
    advice: "Make informed choices based on current evidence and personal goals.",
    order: 10,
    active: true
  },
  {
    category: "Career / Future Stress",
    question: "How can I balance career preparation with college life?",
    answer: "Allocate specific weekly time slots for career preparation so it does not interfere with daily academic coursework or essential rest.",
    advice: "Use dedicated weekly windows for resume work and skill prep.",
    order: 11,
    active: true
  },
  {
    category: "Career / Future Stress",
    question: "What can I do when I feel unsuccessful compared with my friends?",
    answer: "Success has many definitions beyond immediate job offers. Focus on your effort, personal growth, and continuous learning.",
    advice: "Value your personal progress and skill growth over comparisons.",
    order: 12,
    active: true
  },
  {
    category: "Career / Future Stress",
    question: "How can I build confidence for interviews?",
    answer: "Practice mock interviews with peers or career coordinators. Rehearsing responses to common questions builds clarity and reduces anxiety.",
    advice: "Conduct mock interview sessions to build natural speaking confidence.",
    order: 13,
    active: true
  },
  {
    category: "Career / Future Stress",
    question: "What should I do if I am unsure about my strengths and skills?",
    answer: "Reflect on past projects, coursework, or extracurricular activities where you felt engaged. Asking mentors for feedback can also highlight your strengths.",
    advice: "Seek feedback from faculty and mentors to discover your core strengths.",
    order: 14,
    active: true
  },
  {
    category: "Career / Future Stress",
    question: "When should I talk to someone about career-related stress?",
    answer: "If career stress causes persistent anxiety, low mood, or feelings of helplessness, speaking with a counselor or career mentor offers valuable perspective.",
    advice: "MindCare counselors can help you navigate career anxiety constructively.",
    order: 15,
    active: true
  },

  // ==========================================
  // 5. FINANCIAL STRESS (15 Items)
  // ==========================================
  {
    category: "Financial Stress",
    question: "Why can financial problems affect mental well-being?",
    answer: "Financial difficulties create pressure around basic needs and educational expenses. Organizing expenses into clear categories reduces feeling overwhelmed.",
    advice: "Track fixed expenses to gain clarity and control over your budget.",
    order: 1,
    active: true
  },
  {
    category: "Financial Stress",
    question: "How can I manage stress caused by financial difficulties?",
    answer: "Focus on controllable daily expenses, explore institutional aid, and speak transparently with family or administrative financial officers.",
    advice: "Focus on clear budget planning and available financial resources.",
    order: 2,
    active: true
  },
  {
    category: "Financial Stress",
    question: "What can I do if I worry constantly about money?",
    answer: "Set aside dedicated times to review your budget rather than worrying continuously. Focus on actionable steps like applying for scholarships.",
    advice: "Designate specific time blocks for managing finances.",
    order: 3,
    active: true
  },
  {
    category: "Financial Stress",
    question: "How can students manage financial pressure responsibly?",
    answer: "Create a simple monthly budget that prioritizes essential academic and living needs while curbing non-essential impulse spending.",
    advice: "Maintain a simple weekly budget log to monitor expenses.",
    order: 4,
    active: true
  },
  {
    category: "Financial Stress",
    question: "How can I avoid comparing my financial situation with others?",
    answer: "Financial backgrounds vary widely. Focus on your personal educational goals and budget rather than trying to match others' spending habits.",
    advice: "Stick to your personal financial plan regardless of peer spending.",
    order: 5,
    active: true
  },
  {
    category: "Financial Stress",
    question: "What should I do if financial problems affect my studies?",
    answer: "Inform student welfare or financial aid officers about your situation. Institutions often have emergency grants or flexible payment plans.",
    advice: "Reach out to campus student welfare offices for assistance.",
    order: 6,
    active: true
  },
  {
    category: "Financial Stress",
    question: "How can I plan my expenses as a student?",
    answer: "List your monthly income/allowance and subtract essential costs (fees, food, supplies). Keep a small buffer for unexpected expenses.",
    advice: "Review your expense plan at the start of each month.",
    order: 7,
    active: true
  },
  {
    category: "Financial Stress",
    question: "How can I handle pressure to earn money while studying?",
    answer: "If working part-time, choose roles with flexible hours (like campus work-study) so your work commitments do not harm your grades or health.",
    advice: "Keep part-time work hours within a manageable weekly limit.",
    order: 8,
    active: true
  },
  {
    category: "Financial Stress",
    question: "What can I do when I feel embarrassed about financial difficulties?",
    answer: "Financial constraints are common student experiences and do not reflect your character or potential. Focus on your educational journey.",
    advice: "Remember that financial circumstances are temporary and manageable.",
    order: 9,
    active: true
  },
  {
    category: "Financial Stress",
    question: "How can I talk to someone about financial stress?",
    answer: "Speak calmly with family members or campus counselors. Present clear figures so you can work together toward practical solutions.",
    advice: "Gather fee and expense details before discussing financial needs.",
    order: 10,
    active: true
  },
  {
    category: "Financial Stress",
    question: "How can I reduce unnecessary financial worries?",
    answer: "Distinguish between essential needs and optional wants. Delaying non-essential purchases reduces daily financial strain.",
    advice: "Practice a 24-hour waiting period before non-essential purchases.",
    order: 11,
    active: true
  },
  {
    category: "Financial Stress",
    question: "What should I do if financial stress affects my sleep?",
    answer: "Avoid reviewing financial figures late at night. Write down your financial tasks during the day so your mind can rest at night.",
    advice: "Keep financial planning out of your evening wind-down routine.",
    order: 12,
    active: true
  },
  {
    category: "Financial Stress",
    question: "How can I focus on my studies during financial difficulties?",
    answer: "Remind yourself that your education is the primary path to future stability. Utilize free campus libraries and academic resources.",
    advice: "Focus on your academic progress to build future opportunities.",
    order: 13,
    active: true
  },
  {
    category: "Financial Stress",
    question: "What kind of support can students seek for financial problems?",
    answer: "Explore institutional scholarships, emergency student funds, state grants, and work-study opportunities available on campus.",
    advice: "Inquire about scholarship deadlines at your campus administrative office.",
    order: 14,
    active: true
  },
  {
    category: "Financial Stress",
    question: "When should financial stress be discussed with a counselor?",
    answer: "If financial worries lead to ongoing distress, sleep deprivation, or thoughts of leaving college, speaking with a counselor provides supportive guidance.",
    advice: "Counselors offer confidential support to help navigate student stress.",
    order: 15,
    active: true
  },

  // ==========================================
  // 6. RELATIONSHIP / SOCIAL STRESS (15 Items)
  // ==========================================
  {
    category: "Relationship / Social Stress",
    question: "Why can relationship problems affect my mental well-being?",
    answer: "Social connections are important to our emotional security. Conflicts with friends or partners naturally create emotional distraction, which can be managed through calm communication.",
    advice: "Address relationship concerns calmly to protect your peace of mind.",
    order: 1,
    active: true
  },
  {
    category: "Relationship / Social Stress",
    question: "How can I handle conflicts with friends?",
    answer: "Talk directly and privately with your friend. Express your perspective using 'I' statements and listen openly to their side.",
    advice: "Focus on understanding each other rather than winning the argument.",
    order: 2,
    active: true
  },
  {
    category: "Relationship / Social Stress",
    question: "What should I do if I feel ignored by my friends?",
    answer: "Check in with them gently, as they may be busy with their own coursework or personal issues. If distance continues, seek out new campus groups.",
    advice: "Communicate openly without jumping to negative conclusions.",
    order: 3,
    active: true
  },
  {
    category: "Relationship / Social Stress",
    question: "How can I deal with misunderstandings in relationships?",
    answer: "Clear up misunderstandings early before assumptions grow. A simple, honest conversation resolves most communication gaps.",
    advice: "Prefer direct conversations over textual misinterpretations.",
    order: 4,
    active: true
  },
  {
    category: "Relationship / Social Stress",
    question: "What can I do when I feel pressured by my social circle?",
    answer: "Politely state your boundaries. True friends respect your decisions when you decline activities that conflict with your values or schedule.",
    advice: "Stand firm in your personal boundaries with polite clarity.",
    order: 5,
    active: true
  },
  {
    category: "Relationship / Social Stress",
    question: "How can I set healthy boundaries with others?",
    answer: "Communicate clearly what you can and cannot do. Setting boundaries around study time and personal rest preserves healthy relationships.",
    advice: "Explain your quiet hours and study needs to friends respectfully.",
    order: 6,
    active: true
  },
  {
    category: "Relationship / Social Stress",
    question: "Why do I worry about losing friendships?",
    answer: "Worrying about losing friends is common during life transitions. Focus on nurturing supportive relationships through mutual respect.",
    advice: "Invest time in genuine, reciprocal friendships.",
    order: 7,
    active: true
  },
  {
    category: "Relationship / Social Stress",
    question: "How can I handle disagreements without overthinking?",
    answer: "Keep discussions focused on the immediate issue. Once resolved, move forward without dwelling on past friction.",
    advice: "Address issues promptly and avoid dwelling on past disagreements.",
    order: 8,
    active: true
  },
  {
    category: "Relationship / Social Stress",
    question: "What should I do if a relationship is affecting my studies?",
    answer: "Set firm time boundaries for social interactions so your academic goals receive dedicated attention.",
    advice: "Protect your scheduled study hours from social interruptions.",
    order: 9,
    active: true
  },
  {
    category: "Relationship / Social Stress",
    question: "How can I communicate my feelings more clearly?",
    answer: "Express your thoughts calmly, clearly, and directly without using accusatory language. Listening actively helps mutual understanding.",
    advice: "Use 'I feel...' statements to share your perspective constructive.",
    order: 10,
    active: true
  },
  {
    category: "Relationship / Social Stress",
    question: "What can I do when I feel rejected by someone?",
    answer: "Rejection is part of social life and does not reflect your total worth. Focus on developing connections with people who value you.",
    advice: "Surround yourself with supportive peers who appreciate you.",
    order: 11,
    active: true
  },
  {
    category: "Relationship / Social Stress",
    question: "How can I avoid depending completely on others for emotional support?",
    answer: "Build self-care habits, engage in individual hobbies, and maintain multiple positive connections rather than relying on one person.",
    advice: "Cultivate personal interests and healthy self-reliance.",
    order: 12,
    active: true
  },
  {
    category: "Relationship / Social Stress",
    question: "How can I manage social pressure in college?",
    answer: "Stay true to your personal priorities and values. You do not need to participate in every social event to build good relationships.",
    advice: "Choose social activities that align with your well-being.",
    order: 13,
    active: true
  },
  {
    category: "Relationship / Social Stress",
    question: "What should I do when relationship stress becomes overwhelming?",
    answer: "Take a temporary step back to regain composure. Discussing your feelings with a neutral counselor can clarify your options.",
    advice: "Take a short breather to process emotions calmly.",
    order: 14,
    active: true
  },
  {
    category: "Relationship / Social Stress",
    question: "When should I talk to a counselor about relationship problems?",
    answer: "If interpersonal conflict causes ongoing anxiety, sadness, or distraction from your studies, consulting a counselor offers supportive perspective.",
    advice: "MindCare counselors provide confidential interpersonal guidance.",
    order: 15,
    active: true
  },

  // ==========================================
  // 7. LONELINESS (15 Items)
  // ==========================================
  {
    category: "Loneliness",
    question: "Why do I feel lonely even when people are around me?",
    answer: "Feeling lonely in a crowd happens when interactions lack genuine depth or shared interests. Seeking meaningful connections reduces this feeling.",
    advice: "Focus on building a few deep, authentic connections.",
    order: 1,
    active: true
  },
  {
    category: "Loneliness",
    question: "What can I do when I feel alone in college?",
    answer: "Spend time in shared campus spaces like libraries or dining halls, join interest clubs, and participate in group activities.",
    advice: "Spend study time in communal campus areas.",
    order: 2,
    active: true
  },
  {
    category: "Loneliness",
    question: "How can I make new friends?",
    answer: "Participate in campus clubs, study groups, or sports. Shared interests provide natural opportunities for conversation.",
    advice: "Attend club events aligned with your personal hobbies.",
    order: 3,
    active: true
  },
  {
    category: "Loneliness",
    question: "How can I become more comfortable spending time alone?",
    answer: "Engage in fulfilling personal activities like reading, creative hobbies, or exercise. Enjoyable solo time builds self-reliance.",
    advice: "Develop satisfying solo routines and hobbies.",
    order: 4,
    active: true
  },
  {
    category: "Loneliness",
    question: "Why do I sometimes feel disconnected from others?",
    answer: "Feeling disconnected often occurs during times of stress or transition. Engaging in small daily social interactions rebuilds connection.",
    advice: "Initiate brief friendly conversations with classmates.",
    order: 5,
    active: true
  },
  {
    category: "Loneliness",
    question: "What activities can help reduce feelings of loneliness?",
    answer: "Group sports, volunteering, study groups, and campus cultural clubs offer great opportunities to meet like-minded peers.",
    advice: "Join structured group activities on campus.",
    order: 6,
    active: true
  },
  {
    category: "Loneliness",
    question: "How can I start a conversation with someone new?",
    answer: "Ask open, context-relevant questions about coursework, upcoming events, or campus facilities. Listening warmly invites conversation.",
    advice: "Start with simple questions about shared class topics.",
    order: 7,
    active: true
  },
  {
    category: "Loneliness",
    question: "What should I do if I feel that nobody understands me?",
    answer: "Share your thoughts gradually with trusted mentors, peer groups, or counselors who offer non-judgmental listening.",
    advice: "Connect with campus counseling or peer support groups.",
    order: 8,
    active: true
  },
  {
    category: "Loneliness",
    question: "How can I build meaningful friendships?",
    answer: "Meaningful friendships develop over time through shared experiences, honest communication, and mutual emotional support.",
    advice: "Be patient and consistent in spending time with friends.",
    order: 9,
    active: true
  },
  {
    category: "Loneliness",
    question: "How can I handle loneliness when living away from family?",
    answer: "Schedule regular calls with family while building a comfortable daily routine in your college accommodation.",
    advice: "Maintain scheduled calls home while exploring campus life.",
    order: 10,
    active: true
  },
  {
    category: "Loneliness",
    question: "What can I do when I feel left out?",
    answer: "Remember that group invitations are not always intentional exclusions. Proactively invite peers to study sessions or meals.",
    advice: "Take the initiative to invite classmates for coffee or study.",
    order: 11,
    active: true
  },
  {
    category: "Loneliness",
    question: "How can I become more socially confident?",
    answer: "Practice small social interactions daily, such as greeting peers or asking a question in class. Confidence builds with practice.",
    advice: "Practice micro-interactions daily to build confidence.",
    order: 12,
    active: true
  },
  {
    category: "Loneliness",
    question: "How can hobbies help with loneliness?",
    answer: "Hobbies provide personal satisfaction and connect you naturally with communities of people who share the same passions.",
    advice: "Engage in hobbies that involve local community groups.",
    order: 13,
    active: true
  },
  {
    category: "Loneliness",
    question: "What should I do if loneliness continues for a long time?",
    answer: "If persistent loneliness leads to sadness or withdrawal, reach out to campus counselors to explore supportive connection strategies.",
    advice: "Reach out to campus support services for helpful guidance.",
    order: 14,
    active: true
  },
  {
    category: "Loneliness",
    question: "When should I seek professional support for loneliness?",
    answer: "Seek support if loneliness significantly impacts your mood, academic progress, or daily routine for several weeks.",
    advice: "MindCare counselors offer confidential support for students.",
    order: 15,
    active: true
  },

  // ==========================================
  // 8. FAMILY / EXPECTATION PRESSURE (15 Items)
  // ==========================================
  {
    category: "Family / Expectation Pressure",
    question: "Why do family expectations sometimes feel stressful?",
    answer: "Family expectations often come from a desire for your future security, but high demands can feel heavy. Communicating your progress helps align expectations.",
    advice: "Recognize family concern while setting realistic personal goals.",
    order: 1,
    active: true
  },
  {
    category: "Family / Expectation Pressure",
    question: "How can I handle pressure to meet my family's expectations?",
    answer: "Focus on giving your honest effort. Share your study schedule and progress updates with your family so they understand your work.",
    advice: "Keep family informed about your ongoing academic efforts.",
    order: 2,
    active: true
  },
  {
    category: "Family / Expectation Pressure",
    question: "What should I do if my family compares me with others?",
    answer: "Remind family members respectfully that every individual has unique talents and learning rates. Focus on your individual growth.",
    advice: "Redirect family discussions to your personal goals and progress.",
    order: 3,
    active: true
  },
  {
    category: "Family / Expectation Pressure",
    question: "How can I communicate my goals to my family?",
    answer: "Share clear information about your field of interest, career growth prospects, and your personal dedication in a calm conversation.",
    advice: "Present your plans clearly during a quiet conversation.",
    order: 4,
    active: true
  },
  {
    category: "Family / Expectation Pressure",
    question: "What can I do when I feel afraid of disappointing my parents?",
    answer: "Understand that your parents value your overall well-being and health. Doing your genuine best is what truly matters.",
    advice: "Focus on your dedication and ethical effort.",
    order: 5,
    active: true
  },
  {
    category: "Family / Expectation Pressure",
    question: "How can I balance my goals with family expectations?",
    answer: "Identify areas of shared understanding and communicate your study limits clearly so expectations remain realistic.",
    advice: "Find common ground while maintaining realistic limits.",
    order: 6,
    active: true
  },
  {
    category: "Family / Expectation Pressure",
    question: "Why do I feel guilty when I cannot meet expectations?",
    answer: "Guilt often arises from wanting to please loved ones. Remind yourself that effort and personal health are fundamental for long-term success.",
    advice: "Treat yourself with compassion when working hard.",
    order: 7,
    active: true
  },
  {
    category: "Family / Expectation Pressure",
    question: "How can I deal with pressure about marks and academic performance?",
    answer: "Explain that consistent learning and practical understanding matter alongside numerical marks. Keep focused on your study routine.",
    advice: "Focus on steady learning progress rather than just marks.",
    order: 8,
    active: true
  },
  {
    category: "Family / Expectation Pressure",
    question: "What should I do when my family does not understand my interests?",
    answer: "Share project examples, achievements, or career research in your field to help them understand your passion better over time.",
    advice: "Share project successes to demonstrate your passion.",
    order: 9,
    active: true
  },
  {
    category: "Family / Expectation Pressure",
    question: "How can I respectfully disagree with my family?",
    answer: "Listen to their perspective first, acknowledge their intentions, and express your viewpoint calmly and respectfully.",
    advice: "Maintain a calm and respectful tone during disagreements.",
    order: 10,
    active: true
  },
  {
    category: "Family / Expectation Pressure",
    question: "What can I do when family problems affect my studies?",
    answer: "Set clear time boundaries for study hours, and seek support from campus counselors if family issues cause significant distress.",
    advice: "Protect your study hours and talk to a counselor if needed.",
    order: 11,
    active: true
  },
  {
    category: "Family / Expectation Pressure",
    question: "How can I manage emotional pressure from family?",
    answer: "Focus on internal self-validation and take short emotional breaks when family discussions become overwhelming.",
    advice: "Validate your own hard work and take breaks when needed.",
    order: 12,
    active: true
  },
  {
    category: "Family / Expectation Pressure",
    question: "How can I maintain a healthy relationship with my family?",
    answer: "Communicate regularly about non-stressful topics, show appreciation for their support, and set respectful boundaries.",
    advice: "Maintain warm, regular contact while protecting study time.",
    order: 13,
    active: true
  },
  {
    category: "Family / Expectation Pressure",
    question: "What should I do when family expectations become overwhelming?",
    answer: "Seek objective guidance from campus counselors who can help you develop communication tools and manage pressure.",
    advice: "Schedule a session with a MindCare counselor for guidance.",
    order: 14,
    active: true
  },
  {
    category: "Family / Expectation Pressure",
    question: "When should I talk to a counselor about family pressure?",
    answer: "Speak with a counselor whenever family pressure creates ongoing anxiety, sleep issues, or feelings of inadequacy.",
    advice: "Counselors provide confidential support for family-related stress.",
    order: 15,
    active: true
  },

  // ==========================================
  // 9. SLEEP / REST PROBLEMS (15 Items)
  // ==========================================
  {
    category: "Sleep / Rest Problems",
    question: "Why does stress make it difficult to sleep?",
    answer: "Stress activates bodily alertness, keeping your nervous system awake. Establishing a relaxing bedtime routine helps signal that it is time to sleep.",
    advice: "Create a predictable 20-minute wind-down routine before bed.",
    order: 1,
    active: true
  },
  {
    category: "Sleep / Rest Problems",
    question: "What can I do if I cannot sleep because I am overthinking?",
    answer: "If awake after 20 minutes, get up and sit in dim light to read or listen to soft audio until sleepy, then return to bed.",
    advice: "Avoid staying in bed frustrated; sit in dim light until sleepy.",
    order: 2,
    active: true
  },
  {
    category: "Sleep / Rest Problems",
    question: "How many hours of sleep should a college student generally aim for?",
    answer: "Most college students need 7 to 8 hours of sleep per night for optimal memory retention, mood regulation, and physical recovery.",
    advice: "Prioritize 7-8 hours of sleep for peak cognitive performance.",
    order: 3,
    active: true
  },
  {
    category: "Sleep / Rest Problems",
    question: "How can I improve my sleep routine?",
    answer: "Go to bed and wake up at consistent times daily, dim lights an hour before sleep, and keep your bedroom cool and quiet.",
    advice: "Maintain consistent sleep and wake schedules every day.",
    order: 4,
    active: true
  },
  {
    category: "Sleep / Rest Problems",
    question: "Why do I feel tired even after sleeping?",
    answer: "Feeling tired despite sleep can be caused by irregular sleep times, screen exposure before bed, or high stress levels. Improving sleep environment helps.",
    advice: "Ensure a dark, quiet room and avoid late-night caffeine.",
    order: 5,
    active: true
  },
  {
    category: "Sleep / Rest Problems",
    question: "What can I do to relax before going to bed?",
    answer: "Practice gentle stretching, slow abdominal breathing, or listening to calm music. Avoid intense studying right before lying down.",
    advice: "Engage in calm, non-screen activities before bed.",
    order: 6,
    active: true
  },
  {
    category: "Sleep / Rest Problems",
    question: "How does lack of sleep affect concentration?",
    answer: "Sleep deprivation impairs memory recall, problem-solving, and attention span. Getting enough sleep preserves mental sharpness.",
    advice: "Protect night rest to ensure strong concentration during classes.",
    order: 7,
    active: true
  },
  {
    category: "Sleep / Rest Problems",
    question: "Should I use my phone before sleeping?",
    answer: "Screen blue light suppresses melatonin, making it harder to fall asleep. Turn off devices 30 to 45 minutes before sleep.",
    advice: "Keep phones away from bed and stop screen use before sleeping.",
    order: 8,
    active: true
  },
  {
    category: "Sleep / Rest Problems",
    question: "How can I manage late-night studying?",
    answer: "Shift heavy studying to daylight hours whenever possible. If studying late, take regular breaks and avoid high caffeine near bedtime.",
    advice: "Prioritize daytime study blocks to avoid late-night cramming.",
    order: 9,
    active: true
  },
  {
    category: "Sleep / Rest Problems",
    question: "What should I do if my sleep schedule is irregular?",
    answer: "Anchor your sleep schedule by setting a fixed wake-up time every morning, regardless of what time you fell asleep.",
    advice: "Keep a fixed morning wake-up alarm to reset your internal clock.",
    order: 10,
    active: true
  },
  {
    category: "Sleep / Rest Problems",
    question: "How can I avoid thinking about academic problems at night?",
    answer: "Write down tomorrow's study tasks on a piece of paper before evening, then mentally close your study work for the day.",
    advice: "Write down academic tasks before bed to clear your mind.",
    order: 11,
    active: true
  },
  {
    category: "Sleep / Rest Problems",
    question: "Can regular physical activity support better sleep?",
    answer: "Yes, regular physical movement during the day promotes deeper sleep at night. Avoid intense workouts right before bedtime.",
    advice: "Engage in daytime exercise to support natural nighttime sleep.",
    order: 12,
    active: true
  },
  {
    category: "Sleep / Rest Problems",
    question: "What should I do if stress keeps disturbing my sleep?",
    answer: "Use slow breathing exercises in bed and establish a peaceful wind-down routine. Speak with a professional if insomnia persists.",
    advice: "Practice slow exhalations if you wake up during the night.",
    order: 13,
    active: true
  },
  {
    category: "Sleep / Rest Problems",
    question: "How can I create a relaxing bedtime routine?",
    answer: "Dim room lighting, turn off screens, stretch gently, and practice slow breathing every night at the same time.",
    advice: "Perform the same relaxing sequence every night.",
    order: 14,
    active: true
  },
  {
    category: "Sleep / Rest Problems",
    question: "When should I talk to a professional about ongoing sleep problems?",
    answer: "If sleep difficulties persist for more than a few weeks despite good sleep habits, consult campus health services or a counselor.",
    advice: "Consult campus health professionals for persistent sleep issues.",
    order: 15,
    active: true
  },

  // ==========================================
  // 10. GENERAL STRESS (15 Items)
  // ==========================================
  {
    category: "General Stress",
    question: "Why do I feel stressed even when nothing major is happening?",
    answer: "Small daily demands can accumulate unnoticed over time. Regular relaxation breaks and self-care keep baseline stress low.",
    advice: "Incorporate brief relaxation pauses into your daily routine.",
    order: 1,
    active: true
  },
  {
    category: "General Stress",
    question: "What are some simple ways to manage daily stress?",
    answer: "Maintain regular sleep, eat balanced meals, take study breaks, stay physically active, and talk with supportive friends.",
    advice: "Focus on simple, consistent daily healthy habits.",
    order: 2,
    active: true
  },
  {
    category: "General Stress",
    question: "How can I recognize when stress is becoming too much?",
    answer: "Watch for signs like muscle tension, headaches, constant fatigue, irritability, or difficulty sleeping.",
    advice: "Take prompt rest when physical stress signals appear.",
    order: 3,
    active: true
  },
  {
    category: "General Stress",
    question: "How can I calm myself during a stressful situation?",
    answer: "Pause, place your feet flat on the floor, and take three slow, deep exhalations while relaxing your shoulders.",
    advice: "Use slow exhalations to lower immediate tension.",
    order: 4,
    active: true
  },
  {
    category: "General Stress",
    question: "How does regular physical activity help with stress?",
    answer: "Exercise releases endorphins, reduces stress hormones, and improves overall mood and sleep quality.",
    advice: "Engage in 20 minutes of daily physical movement.",
    order: 5,
    active: true
  },
  {
    category: "General Stress",
    question: "Can music or hobbies help reduce stress?",
    answer: "Yes, engaging in creative hobbies or listening to pleasant music provides genuine mental rest and emotional refreshment.",
    advice: "Dedicate time daily to enjoyable personal hobbies.",
    order: 6,
    active: true
  },
  {
    category: "General Stress",
    question: "How can I manage multiple responsibilities without feeling overwhelmed?",
    answer: "List your tasks in order of priority and tackle them one at a time. Avoid trying to complete everything at once.",
    advice: "Focus on one high-priority task at a time.",
    order: 7,
    active: true
  },
  {
    category: "General Stress",
    question: "What should I do when I feel mentally exhausted?",
    answer: "Give yourself permission to take a complete rest break. Step away from screens and engage in quiet, relaxing activities.",
    advice: "Take a complete non-academic rest break when exhausted.",
    order: 8,
    active: true
  },
  {
    category: "General Stress",
    question: "How can I organize my day to reduce stress?",
    answer: "Plan your day with a simple visual schedule, ensuring you include dedicated time for meals, study, rest, and sleep.",
    advice: "Keep your daily timetable visual and realistic.",
    order: 9,
    active: true
  },
  {
    category: "General Stress",
    question: "Why is taking breaks important for mental well-being?",
    answer: "Breaks prevent cognitive overload, clear mental fatigue, and keep your focus sharp throughout the day.",
    advice: "Take regular short breaks during study sessions.",
    order: 10,
    active: true
  },
  {
    category: "General Stress",
    question: "How can I stop overthinking everyday problems?",
    answer: "Write down your worries on paper to externalize them, focus on actionable solutions, and practice staying present.",
    advice: "Write down concerns to process them constructively.",
    order: 11,
    active: true
  },
  {
    category: "General Stress",
    question: "What healthy habits can support emotional well-being?",
    answer: "Balanced nutrition, regular sleep, physical movement, staying connected with friends, and self-compassion build strong resilience.",
    advice: "Nurture consistent daily routines for emotional health.",
    order: 12,
    active: true
  },
  {
    category: "General Stress",
    question: "How can I manage stress caused by college life?",
    answer: "Establish a structured weekly schedule, seek help early when needed, and maintain supportive friendships.",
    advice: "Build a balanced routine for college work and rest.",
    order: 13,
    active: true
  },
  {
    category: "General Stress",
    question: "What should I do when stress starts affecting my daily life?",
    answer: "Re-evaluate your daily workload, prioritize self-care, and consider reaching out to a campus counselor for guidance.",
    advice: "Seek counselor support if stress disrupts your daily routine.",
    order: 14,
    active: true
  },
  {
    category: "General Stress",
    question: "When should I consider speaking with a counselor?",
    answer: "Consider speaking with a counselor whenever stress feels unmanageable, persistent, or interferes with your student life.",
    advice: "MindCare counselors are available for confidential student support.",
    order: 15,
    active: true
  }
];

module.exports = {
  categories,
  categoryDescriptions,
  wellnessQAData
};
