using Microsoft.EntityFrameworkCore;
using Task5.Models;

namespace Task5.Data
{
    public class ApplicationContext : DbContext
    {
        public DbSet<Element> Elements { get; set; }
        public ApplicationContext(DbContextOptions<ApplicationContext> options) : base(options)
        {
            Database.EnsureCreated();
        }
    }
}
