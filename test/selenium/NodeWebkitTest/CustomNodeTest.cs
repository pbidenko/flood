using System.Linq;
using System.Threading;

using NUnit.Framework;

using OpenQA.Selenium;
using OpenQA.Selenium.Interactions;

namespace NodeWebkitTest
{
    public class CustomNodeTest : Test
    {
        [Test]
        public void T01_CreateCustomNodeTest()
        {
            var file = driver.FindElement(By.Id("add-workspace-button"));
            file.Click();
            Thread.Sleep(1000);
            var create = driver.FindElement(By.Id("add-node-workspace"));
            create.Click();
            Thread.Sleep(1000);
        }

        [Test]
        public void T02_AddInputAndOutputTest()
        {
            var file = driver.FindElement(By.Id("add-workspace-button"));
            var search = driver.FindElement(By.Id("bottom-search"));
            var actions = new Actions(driver);
            search.SendKeys("input");
            Thread.Sleep(1000);
            search = driver.FindElement(By.Id("bottom-search"));
            search.SendKeys(Keys.Return);
            Thread.Sleep(1000);
            search = driver.FindElement(By.Id("bottom-search"));
            search.Clear();
            Thread.Sleep(1000);
            actions.MoveToElement(file, 0, 100).DoubleClick().Build().Perform();
            Thread.Sleep(1000);
            actions.SendKeys("output").Build().Perform();
            Thread.Sleep(1000);
            actions.SendKeys(Keys.Return).Build().Perform();
            Thread.Sleep(1000);
            var output = driver.FindElement(By.ClassName("node-port-output"));
            var input = driver.FindElement(By.ClassName("node-port-input"));
            actions.ClickAndHold(output).Release(input).Build().Perform();
            Thread.Sleep(1000);
        }

        [Test]
        public void T03_RenameCustomNodeTest()
        {
            var actions = new Actions(driver);
            var current = driver.FindElement(By.ClassName("current-workspace"));
            var pencil = current.FindElement(By.ClassName("icon-pencil"));
            actions.MoveToElement(pencil).Build().Perform();
            Thread.Sleep(1000);
            pencil.Click();
            Thread.Sleep(1000);
            var field = current.FindElement(By.ClassName("workspace-name"));
            field.Clear();
            field.SendKeys("CustomNode");
            Thread.Sleep(1000);
            var tabs = driver.FindElements(By.ClassName("workspace-tab"));
            var tab = tabs.First(el => el.Location.X == 0);
            tab.Click();
            Thread.Sleep(1000);
        }

        [Test]
        public void T04_AddCustomNodeOnWorkspaceTest()
        {
            var search = driver.FindElement(By.Id("bottom-search"));
            search.Click();
            Thread.Sleep(1000);
            var customNodes = driver.FindElements(By.XPath("//span[text()='Custom nodes']"));
            var customNode = customNodes.First(el => el.Text == "Custom nodes");
            customNode.Click();
            Thread.Sleep(1000);
            customNodes = driver.FindElements(By.XPath("//span[text()='CustomNode']"));
            customNode = customNodes.First(el => el.Text == "CustomNode");
            customNode.Click();
            Thread.Sleep(1000);
        }

        [Test]
        public void T05_ConnectNodeToCustomNodeTest()
        {
            var actions = new Actions(driver);
            var file = driver.FindElement(By.Id("add-workspace-button"));
            actions.MoveToElement(file, 0, 100).DoubleClick().Build().Perform();
            Thread.Sleep(1000);
            var search = driver.FindElement(By.ClassName("search-top-container"));
            search.FindElement(By.TagName("input")).Clear();
            Thread.Sleep(1000);
            actions.SendKeys("number").Build().Perform();
            Thread.Sleep(1000);
            actions.SendKeys(Keys.Return).Build().Perform();
            Thread.Sleep(1000);
            var output = driver.FindElement(By.ClassName("node-port-output"));
            var input = driver.FindElement(By.ClassName("node-port-input"));
            actions.ClickAndHold(output).Release(input).Build().Perform();
            Thread.Sleep(1000);
            var numberInput = driver.FindElement(By.CssSelector("input.currentValue"));
            numberInput.SendKeys("1");
            numberInput.SendKeys(Keys.Return);
            Thread.Sleep(1000);
            var lastValues = driver.FindElements(By.ClassName("node-last-value"));
            lastValues.First(el => el.Text == "\"1\"");
            Thread.Sleep(1000);
            actions.MoveToElement(file, 100, 200).Click().Build().Perform();
            Thread.Sleep(1000);
        }

        [Test]
        public void T06_DeleteCustomNodeTest()
        {
            var actions = new Actions(driver);
            var customNode = driver.FindElements(By.CssSelector("span.name.searchfield"));
            customNode.First(el => el.Text == "CustomNode").Click();
            actions.SendKeys(Keys.Delete).Build().Perform();
        }

    }
}
