using System;
using System.Runtime.InteropServices;
using System.Security.Permissions;
using Microsoft.SharePoint;
using Microsoft.SharePoint.Security;
using System.Diagnostics;

namespace Neudesic.SP.Mobile
{
    /// <summary>
    /// This class handles events raised during feature activation, deactivation, installation, uninstallation, and upgrade.
    /// </summary>
    /// <remarks>
    /// The GUID attached to this class may be used during packaging and should not be modified.
    /// </remarks>

    [Guid("93a0f325-8988-4207-b126-8f54374c9cc6")]
    public class SlingshotEventReceiver : SPFeatureReceiver
    {
        // Uncomment the method below to handle the event raised after a feature has been activated.

        public override void FeatureActivated(SPFeatureReceiverProperties properties)
        {
            using (SPWeb currentWeb = (SPWeb)properties.Feature.Parent)
            {
                try
                {
                    if (currentWeb.WebTemplateId != 1) //team site
                    {
                        throw new SPException("Error(s) Occured. Slingshot feature can only be activated on Team site at the moment.");
                    }
                }
                catch (SPException)
                {
                    System.Web.HttpContext.Current.Response.Redirect("/_layouts/Neudesic/CanNotActivateSlingshotFeature.aspx", false);
                    System.Web.HttpContext.Current.Response.End();
                }
                catch (Exception ex)
                {
                    Log.LogIt("Error in Neudesic.SP.Mobile.Features.Slingshot.FeatureActivated: " + ex.Message, "Error");
                }
            }
        }


        // Uncomment the method below to handle the event raised before a feature is deactivated.

        //public override void FeatureDeactivating(SPFeatureReceiverProperties properties)
        //{
        //}


        // Uncomment the method below to handle the event raised after a feature has been installed.

        //public override void FeatureInstalled(SPFeatureReceiverProperties properties)
        //{
        //}


        // Uncomment the method below to handle the event raised before a feature is uninstalled.

        //public override void FeatureUninstalling(SPFeatureReceiverProperties properties)
        //{
        //}

        // Uncomment the method below to handle the event raised when a feature is upgrading.

        //public override void FeatureUpgrading(SPFeatureReceiverProperties properties, string upgradeActionName, System.Collections.Generic.IDictionary<string, string> parameters)
        //{
        //}
    }
    public class Log
    {
        public Log() { }
        public static void LogIt(string msg, string type)
        {
            //Method used for logging errors or other messages to the Event log.
            System.Security.Principal.WindowsImpersonationContext wic = null;
            try
            {
                wic = System.Security.Principal.WindowsIdentity.Impersonate(IntPtr.Zero);
                string source = "Neudesic Mobile Application";
                string logName = "Application";
                string message = msg;
                if (!EventLog.SourceExists(source))
                {
                    EventLog.CreateEventSource(source, logName);
                }
                if (type.ToLower() == "msg" || type.ToLower() == "info")
                {
                    EventLog.WriteEntry(source, message, EventLogEntryType.Information);
                }
                else if (type.ToLower() == "warning")
                {
                    EventLog.WriteEntry(source, message, EventLogEntryType.Warning);
                }
                else
                {
                    EventLog.WriteEntry(source, message, EventLogEntryType.Error);
                }

            }
            catch (Exception ex)
            {
                LogIt(ex.ToString(), "Error");
                throw new Exception(ex.ToString());
            }
            finally
            {
                if (wic != null)
                    wic.Undo();
            }
        }


    }

}
