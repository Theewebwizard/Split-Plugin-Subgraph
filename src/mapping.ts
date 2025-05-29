import { BigInt, Bytes } from "@graphprotocol/graph-ts";
import {
  AutomationSwitched,
  SplitConfigCreated,
  SplitConfigDeleted,
  SplitConfigFailed,
  SplitExecuted,
} from "../generated/SplitPlugin/SplitPlugin";
import {
  SplitConfig,
  SplitExecution,
  SplitFailure,
  AutomationSetting,
} from "../generated/schema";

export function handleSplitConfigCreated(event: SplitConfigCreated): void {
  const id = event.params.configIndex.toString();
  let config = new SplitConfig(id);

  config.dao = event.transaction.from;
  config.plugin = event.address;
  config.configId = Bytes.fromI32(event.params.configIndex.toI32());
  config.creator = event.params.user;
  config.createdAt = event.block.timestamp;
  config.automated = false;
  config.isSplitEnabled = true;

  config.save();
}

export function handleSplitExecuted(event: SplitExecuted): void {
  const id =
    event.transaction.hash.toHexString() + "-" + event.logIndex.toString();
  let execution = new SplitExecution(id);

  execution.config = event.params.configIndex.toString();
  execution.timestamp = event.block.timestamp;
  execution.txHash = event.transaction.hash;

  execution.save();
}

export function handleSplitConfigDeleted(event: SplitConfigDeleted): void {
  const id = event.params.configIndex.toString();
  let config = SplitConfig.load(id);
  if (config) {
    config.isSplitEnabled = false;
    config.save();
  }
}

export function handleSplitConfigFailed(event: SplitConfigFailed): void {
  const id =
    event.transaction.hash.toHexString() + "-" + event.logIndex.toString();
  let failure = new SplitFailure(id);

  failure.config = event.params.configIndex.toString();
  failure.reason = event.params.err;
  failure.timestamp = event.block.timestamp;
  failure.txHash = event.transaction.hash;

  failure.save();
}

export function handleAutomationSwitched(event: AutomationSwitched): void {
  const id = event.params.configIndex.toString();
  let setting = AutomationSetting.load(id);

  if (!setting) {
    setting = new AutomationSetting(id);
  }

  setting.automated = event.params.currentState;
  setting.save();
}
