using System;
using Microsoft.SharePoint;
using Microsoft.SharePoint.WebControls;

namespace Neudesic.SP.Mobile.Layouts
{
    public partial class Index : LayoutsPageBase
    {
        protected void Page_Load(object sender, EventArgs e)
        {
            string url = SPContext.Current.Web.Url.Replace("http://",string.Empty);            
            Response.Redirect("./index.html?WebUrl=" + url, false);
        }
    }
}
