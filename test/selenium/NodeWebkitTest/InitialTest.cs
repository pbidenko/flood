using System.Threading;

using NUnit.Framework;

using OpenQA.Selenium;

namespace NodeWebkitTest
{
    public class InitialTest : Test
    {
        [Test]
        public void T01_WorkspaceExistTest()
        {
            // Check if workspace exist
            var elem = driver.FindElement(By.ClassName("workspace-name"));
            Assert.AreEqual("New workspace", elem.GetAttribute("value"));
            Thread.Sleep(1000);
        }

        [Test]
        public void T02_ModelsLoadedTest()
        {
            // Check models existance in search menu
            var elems = driver.FindElements(By.ClassName("search-element"));
            Assert.Greater(elems.Count, 800);
            Thread.Sleep(1000);
        }

        [Test]
        public void T03_NwkDesigneTest()
        {
            // Check menu elements for corresponding to NWK design pattern
            // If element exist - throw an exception
            try
            {
                driver.FindElement(By.ClassName("add-project-workspace"));
                Assert.Fail("Unexpected element");
            }
            catch (NoSuchElementException) { }

            try
            {
                driver.FindElement(By.ClassName("login-button"));
                Assert.Fail("Unexpected element");
            }
            catch (NoSuchElementException) { }

            try
            {
                driver.FindElement(By.ClassName("workspace-browser-button"));
                Assert.Fail("Unexpected element");
            }
            catch (NoSuchElementException) { }
            Thread.Sleep(1000);
        }
    }
}
