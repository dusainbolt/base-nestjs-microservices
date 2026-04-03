/**
 * Global Soft Delete Extension for Prisma.
 * This can be reused across multiple microservices by passing their specific Prisma object.
 */
export const softDeleteExtension = (PrismaNamespace: any) => {
  return PrismaNamespace.defineExtension((client: any) => {
    return client.$extends({
      name: 'softDelete',
      model: {
        $allModels: {
          async delete(this: any, args: any): Promise<any> {
            const context = PrismaNamespace.getExtensionContext(this);
            return (context as any).update({
              where: (args as any).where,
              data: { deletedAt: new Date() },
            });
          },
          async deleteMany(this: any, args?: any): Promise<any> {
            const context = PrismaNamespace.getExtensionContext(this);
            return (context as any).updateMany({
              where: (args as any).where,
              data: { deletedAt: new Date() },
            });
          },
        },
      },
      query: {
        $allModels: {
          async $allOperations({ operation, args, query }: any) {
            if (
              [
                'findFirst',
                'findFirstOrThrow',
                'findMany',
                'findUnique',
                'findUniqueOrThrow',
                'count',
                'aggregate',
                'groupBy',
              ].includes(operation)
            ) {
              const userArgs = args as any;
              userArgs.where = { deletedAt: null, ...userArgs.where };
              return query(userArgs);
            }
            return query(args);
          },
        },
      },
    });
  });
};
