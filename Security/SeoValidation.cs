using System.ComponentModel.DataAnnotations;

namespace test.Cms12.Security;

/// <summary>
/// Validatorer för SEO-metadata.
/// Säkerställer att redaktörer följer best practices för titel- och beskrivningslängd.
/// </summary>
public class SeoValidation
{
    /// <summary>
    /// Validerar att meta title inte är för lång (max 60 tecken).
    /// Google visar vanligtvis första 50-60 tecken i sökresultat.
    /// </summary>
    public class MetaTitleValidator : ValidationAttribute
    {
        public override bool IsValid(object? value)
        {
            if (value == null)
                return true;

            if (value is not string title)
                return false;

            return title.Length <= 60;
        }

        public override string FormatErrorMessage(string name)
        {
            return $"{name} kan vara maximal 60 tecken (nu: länge). Tipz: Sätt viktiga ord först.";
        }
    }

    /// <summary>
    /// Validerar att meta description inte är för lång (max 160 tecken).
    /// Google visar vanligtvis första 155-160 tecken på desktop.
    /// </summary>
    public class MetaDescriptionValidator : ValidationAttribute
    {
        public override bool IsValid(object? value)
        {
            if (value == null)
                return true;

            if (value is not string description)
                return false;

            return description.Length <= 160;
        }

        public override string FormatErrorMessage(string name)
        {
            return $"{name} kan vara maximal 160 tecken (nu: länge). Tips: Beskriv huvudsammanfattningen först, sedan detaljer.";
        }
    }
}
