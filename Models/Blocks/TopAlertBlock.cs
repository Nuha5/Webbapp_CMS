using System;
using System.ComponentModel.DataAnnotations;
using EPiServer.Core;
using EPiServer.DataAnnotations;
using EPiServer.Shell.ObjectEditing;
using test.Cms12.Helpers;

namespace test.Cms12.Models.Blocks
{
    [ContentType(
        DisplayName = "Top Alert Banner",
        GUID = "d4c5e2a1-3b4f-4e6d-9c8b-1f2a3d4e5f6a",
        Description = "Dismissible top bar alert banner with date range visibility"
    )]
    public class TopAlertBlock : BlockData
    {
        [Display(
            Name = "Enable Alert",
            Description = "Toggle to show or hide this alert",
            GroupName = SystemTabNames.Content,
            Order = 10
        )]
        public virtual bool IsEnabled { get; set; }

        [Display(
            Name = "Message",
            Description = "The alert message to display",
            GroupName = SystemTabNames.Content,
            Order = 20
        )]
        [StringLength(500)]
        [Required]
        public virtual string? Message { get; set; }

        [Display(
            Name = "Show From Date",
            Description = "Alert will be visible from this date and time",
            GroupName = SystemTabNames.Content,
            Order = 30
        )]
        [Required]
        public virtual DateTime ShowFromDate { get; set; }

        [Display(
            Name = "Show To Date",
            Description = "Alert will be hidden after this date and time",
            GroupName = SystemTabNames.Content,
            Order = 40
        )]
        [Required]
        public virtual DateTime ShowToDate { get; set; }

        [Display(
            Name = "Alert Type",
            Description = "Choose the alert style/severity level",
            GroupName = SystemTabNames.Content,
            Order = 50
        )]
        [UIHint("AlertTypeSelector")]
        public virtual AlertType AlertType { get; set; }

        public override void SetDefaultValues(ContentType contentType)
        {
            base.SetDefaultValues(contentType);
            IsEnabled = true;
            ShowFromDate = DateTime.Now;
            ShowToDate = DateTime.Now.AddDays(1);
            AlertType = AlertType.Info;
        }
    }

    public enum AlertType
    {
        [Display(Name = "Warning")]
        Warning = 1,

        [Display(Name = "Info")]
        Info = 2,

        [Display(Name = "Nyheter")]
        News = 3,
    }
}
