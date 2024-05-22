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

const departmentDetails = async (parent, { departmentId }, { prisma }) => {
  try {
    const department = await buildDepartmentTree(departmentId, prisma);
    if (!department) {
      return {
        statusCode: 404,
        status: "error",
        message: "Department not found | Departamento não encontrado"
      };
    }
    return {
      statusCode: 200,
      status: "success",
      message: "Department retrieved successfully | Departamento recuperado com sucesso",
      result: department
    };
  } catch (error) {
    return {
      statusCode: 500,
      status: "error",
      message: "Internal server error | Erro interno do servidor"
    };
  }
};

module.exports = { departmentDetails };
