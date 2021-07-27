using Microsoft.AspNetCore.SignalR;
using System.Threading.Tasks;
using Task5.Models;
using Task5.Repositories;

namespace Task5.Hubs
{
    public class CanvasHub : Hub
    {
        private readonly ElementRepository _elementRepository;

        public CanvasHub(ElementRepository elementRepository)
        {
            _elementRepository = elementRepository;
        }

        public async Task AddDraw(Element newElement)
        {
            await Clients.All.SendAsync("ReceiveDraw", await _elementRepository.Create(newElement));
        }

        public async Task GetElemenets()
        {
            await Clients.Caller.SendAsync("InitialDraw", await _elementRepository.Get());
        }

        public async Task UpdateElement(Element updatedElement)
        {
            await Clients.AllExcept(Context.ConnectionId)
                .SendAsync("ReceiveUpdatedElement", await _elementRepository.Update(updatedElement));
        }

        public async Task RemoveElement(Element newElement)
        {
            await Clients.All.SendAsync("ReceiveRemovedElement", await _elementRepository.Remove(newElement));
        }

    }
}
