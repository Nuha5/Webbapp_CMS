using System.Collections.Generic;
using EPiServer.Shell.ObjectEditing;
using test.Cms12.Models.Blocks;

namespace test.Cms12.Helpers
{
    public class AlertTypeSelectionFactory : ISelectionFactory
    {
        public IEnumerable<ISelectItem> GetSelections(ExtendedMetadata metadata)
        {
            var items = new List<SelectItem>
            {
                new SelectItem { Text = "Warning (Röd)", Value = (int)AlertType.Warning },
                new SelectItem { Text = "Info (Blå)", Value = (int)AlertType.Info },
                new SelectItem { Text = "Nyheter (Grön)", Value = (int)AlertType.News },
            };

            return items;
        }
    }
}
