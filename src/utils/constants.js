export const UserRolesEnum = {
  ADMIN: "admin",
  PROJECT_ADMIN: "project-admin",
  MEMBER: "member",
};

//Enum means that we can loop through it

export const AvailableUserRole = Object.values(UserRolesEnum);

export const TaskStatusEnum = {
  TODO: "todo",
  IN_PROGRESS: "in-progress",
  DONE: "done",
};

export const AvailableTaskStatus = Object.values(TaskStatusEnum);
