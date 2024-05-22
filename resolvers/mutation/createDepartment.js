const { v4: uuidv4 } = require('uuid');

const createDepartment = async (parent, { input }, { prisma }) => {
  try {
    const newDepartment = await prisma.department.create({
      data: {
        id: uuidv4(),
        name: input.name,
        code: input.code,
        type: input.type,
        enabled: input.enabled,
        parentId: input.parentId || null
      }
    });

    return {
      statusCode: 201,
      status: "success",
      message: "Department created successfully | Departamento criado com sucesso",
      result: newDepartment
    };
  } catch (error) {
    console.error("Error creating department:", error);
    return {
      statusCode: 500,
      status: "error",
      message: "Internal server error | Erro interno do servidor"
    };
  }
};

module.exports = { createDepartment };
