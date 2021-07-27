using System.ComponentModel.DataAnnotations;

namespace Task5.Models
{
    public class Element
    {
        [Key]
        public int Id { get; set; }
        [Required]
        public string ElementType{ get; set; }
        public string Text { get; set; }
        public double Left { get; set; }
        public double Top { get; set; }
        public double Height { get; set; }
        public double Width { get; set; }
        public string Path { get; set; }
    }
}
