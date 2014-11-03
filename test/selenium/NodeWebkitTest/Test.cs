using System;
using System.Threading;

using NUnit.Framework;

using OpenQA.Selenium;
using OpenQA.Selenium.Remote;
using OpenQA.Selenium.Support.UI;

namespace NodeWebkitTest
{
    public abstract class Test
    {
        protected IWebDriver driver;

        [TestFixtureSetUp]
        public void SetupTest()
        {
            // Connect to remote web driver
            driver = new RemoteWebDriver(new Uri("http://127.0.0.1:4444/wd/hub"), DesiredCapabilities.Chrome());

            var wait = new WebDriverWait(driver, TimeSpan.FromSeconds(30));

            // Check if loaded
            wait.Until(d => d.Url.Contains("app.html"));

            // Wait some time till UI fully loaded
            Thread.Sleep(3000);
        }

        [TestFixtureTearDown]
        public void TeardownTest()
        {
            try
            {
                driver.Quit();
            }
            catch (Exception)
            {
                // Ignore errors if unable to close the browser
            }
        }
    }
}
