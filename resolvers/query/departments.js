const buildDepartmentTree = async (departmentId, prisma) => {
  const department = await prisma.department.findUnique({
    where: { id: departmentId },
    include: {
      people: true,
      children: true
    }
  });

  if (department) {
    const childrenTree = await Promise.all(department.children.map(child => buildDepartmentTree(child.id, prisma)));

    return {
      ...department,
      numberOfPeople: department.people.length,
      ...(childrenTree.length > 0 && { children: childrenTree })
    };
  }
  return null;
};

const departments = async (parent, { filter, search, pageSize = 10, currentPage = 1 }, { prisma }) => {
  try {
    let departments = await prisma.department.findMany({ where: { parentId: null } });

    if (filter) {
      if (filter.name) {
        departments = departments.filter(dept => dept.name.includes(filter.name));
      }
      if (filter.code) {
        departments = departments.filter(dept => dept.code.includes(filter.code));
      }
      if (filter.description) {
        departments = departments.filter(dept => dept.description.includes(filter.description));
      }
      if (filter.type) {
        departments = departments.filter(dept => dept.type.includes(filter.type));
      }
      if (filter.enabled !== undefined) {
        departments = departments.filter(dept => dept.enabled === filter.enabled);
      }
    }

    if (search) {
      departments = departments.filter(dept =>
        dept.name.includes(search) ||
        dept.code.includes(search) ||
        dept.type.includes(search)
      );
    }

    const totalResults = departments.length;
    const totalPages = Math.ceil(totalResults / pageSize);
    const start = (currentPage - 1) * pageSize;
    const paginatedDepartments = departments.slice(start, start + pageSize);

    return {
      statusCode: 200,
      status: "success",
      message: "Departments retrieved successfully | Departamentos recuperados com sucesso",
      totalResults,
      totalPages,
      currentPage,
      results: await Promise.all(paginatedDepartments.map(department => buildDepartmentTree(department.id, prisma)))
    };
  } catch (error) {
    return {
      statusCode: 500,
      status: "error",
      message: "Internal server error | Erro interno do servidor"
    };
  }
};

module.exports = { departments };
