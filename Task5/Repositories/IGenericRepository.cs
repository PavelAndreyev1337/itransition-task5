using System.Collections.Generic;
using System.Threading.Tasks;

namespace Task5.Repositories
{
    public interface IGenericRepository<TEntity> where TEntity : class
    {
        public Task<TEntity> Create(TEntity item);
        public Task<TEntity> FindById(int id);
        public Task<IEnumerable<TEntity>> Get();
        public Task<TEntity> Remove(TEntity item);
        public Task<TEntity> Update(TEntity item);
    }
}
