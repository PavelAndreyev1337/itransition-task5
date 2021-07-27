using Task5.Data;
using Task5.Models;

namespace Task5.Repositories
{
    public class ElementRepository : EFGenericRepository<Element>
    {
        public ElementRepository(ApplicationContext context) : base(context) {}
    }
}
