import { Gap, Page, WorkoutDateSection, WorkoutHeader } from "@/components";

// Sample workout data matching the design
const workoutData = [
  {
    date: "Today",
    status: "in-progress" as const,
    workouts: [
      {
        id: "today-wod1",
        title: "WOD 1",
        exercises: [
          "3 Rounds:",
          "10 Front Squat",
          "10 KB Swings",
          "10 Sec Clean Hold",
          "3 Min Row",
        ],
      },
      {
        id: "today-wod2",
        title: "WOD 2",
        exercises: [
          "3 Rounds:",
          "10 Front Squat",
          "10 KB Swings",
          "10 Sec Clean Hold",
          "3 Min Row",
        ],
      },
      {
        id: "today-wod3",
        title: "WOD 3",
        exercises: ["Up to 70%:", "1 Power Clean"],
      },
    ],
  },
  {
    date: "Yesterday, Feb 17",
    status: "completed" as const,
    workouts: [
      {
        id: "yesterday-wod1",
        title: "WOD 1",
        exercises: [
          "3 Rounds:",
          "10 Front Squat",
          "10 KB Swings",
          "10 Sec Clean Hold",
          "3 Min Row",
        ],
      },
    ],
  },
  {
    date: "Monday, Feb 16",
    status: "completed" as const,
    workouts: [
      {
        id: "monday-wod1",
        title: "WOD 1",
        exercises: [
          "3 Rounds:",
          "10 Front Squat",
          "10 KB Swings",
          "10 Sec Clean Hold",
          "3 Min Row",
        ],
      },
      {
        id: "monday-wod2",
        title: "WOD 2",
        exercises: ["Up to 70%:", "1 Power Clean"],
      },
      {
        id: "monday-wod3",
        title: "WOD 3",
        exercises: ["Up to 70%:", "1 Power Clean"],
      },
    ],
  },
  {
    date: "Sunday, Feb 15",
    status: "completed" as const,
    workouts: [
      {
        id: "sunday-wod1",
        title: "WOD 1",
        exercises: [
          "3 Rounds:",
          "10 Front Squat",
          "10 KB Swings",
          "10 Sec Clean Hold",
        ],
      },
      {
        id: "sunday-wod2",
        title: "WOD 2",
        exercises: ["Up to 70%:", "1 Power Clean"],
      },
      {
        id: "sunday-wod3",
        title: "WOD 3",
        exercises: ["Up to 70%:", "1 Power Clean"],
      },
    ],
  },
];

export default function WorkoutsScreen() {
  return (
    <Page showBackButton={false}>
      <WorkoutHeader />
      <Gap size={26} />

      {workoutData.map((section, index) => (
        <WorkoutDateSection
          key={index}
          date={section.date}
          status={section.status}
          workouts={section.workouts}
        />
      ))}
    </Page>
  );
}
