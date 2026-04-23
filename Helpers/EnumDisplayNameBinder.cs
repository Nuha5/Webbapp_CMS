using System;
using System.ComponentModel.DataAnnotations;
using EPiServer.Cms.Shell.UI.Models;
using EPiServer.DataAnnotations;

namespace test.Cms12.Helpers
{
    /// <summary>
    /// Helper to get display names from enum Display attributes
    /// </summary>
    public static class EnumDisplayNameBinder
    {
        public static string GetDisplayName(Enum enumValue)
        {
            if (enumValue == null)
                return string.Empty;

            var field = enumValue.GetType().GetField(enumValue.ToString());
            if (field == null)
                return enumValue.ToString();

            var displayAttribute = (DisplayAttribute)
                Attribute.GetCustomAttribute(field, typeof(DisplayAttribute));
            return displayAttribute?.Name ?? enumValue.ToString();
        }
    }
}
