using System.Linq;
using System.Threading;

using NUnit.Framework;

using OpenQA.Selenium;
using OpenQA.Selenium.Interactions;

namespace NodeWebkitTest
{
    public class WorkspaceTest : Test
    {
        [Test]
        public void T01_NodeAddFromSearchMenuTest()
        {
            // Add new node.
            // We need to use driver.FindElement each time we want to operate on element to avoid exceptions.
            var search = driver.FindElement(By.Id("bottom-search"));
            search.SendKeys("number");
            Thread.Sleep(1000);
            search = driver.FindElement(By.Id("bottom-search"));
            search.SendKeys(Keys.Return);
            Thread.Sleep(1000);
            search = driver.FindElement(By.Id("bottom-search"));
            search.Clear();
            Thread.Sleep(1000);
        }

        [Test]
        public void T02_NodeAddByDoubleClickTest()
        {
            // Add new node by doubleclick.
            var actions = new Actions(driver);
            var file = driver.FindElement(By.Id("add-workspace-button"));

            actions.MoveToElement(file, 0, 100).DoubleClick().Build().Perform();
            Thread.Sleep(1000);
            actions.SendKeys("point").Build().Perform();
            Thread.Sleep(1000);
            actions.SendKeys(Keys.Return).Build().Perform();
            Thread.Sleep(1000);
        }

        [Test]
        public void T03_MakeConnectionTest()
        {
            // Make connections between nodes
            var actions = new Actions(driver);
            var allPorts = driver.FindElements(By.ClassName("node-port-name"));
            var outputPort = allPorts.First(el => el.Text == "⇒");
            var inputPort = allPorts.First(el => el.Text == "x");

            actions.ClickAndHold(outputPort).Release(inputPort).Build().Perform();
            Thread.Sleep(1000);
            driver.FindElements(By.ClassName("connection"));
            Thread.Sleep(1000);
        }

        [Test]
        public void T04_ChangeNodeValueTest()
        {
            // Change node value
            var numberInput = driver.FindElement(By.CssSelector("input.currentValue"));
            numberInput.SendKeys("1");
            numberInput.SendKeys(Keys.Return);
            Thread.Sleep(2000);

            // Check node value received from server
            Assert.IsTrue(driver.PageSource.Contains("Point(X = 1.000, Y = 0.000, Z = 0.000)"));
        }
    }
}
