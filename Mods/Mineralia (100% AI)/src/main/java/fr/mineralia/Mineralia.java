package fr.mineralia;

import net.minecraft.core.registries.Registries;
import net.minecraft.world.item.BlockItem;
import net.minecraft.world.item.Item;
import net.minecraft.world.level.block.Block;
import net.minecraft.world.level.block.DropExperienceBlock;
import net.minecraft.world.level.block.state.BlockBehaviour;
import net.minecraft.util.valueproviders.UniformInt;
import net.neoforged.bus.api.IEventBus;
import net.neoforged.fml.common.Mod;
import net.neoforged.neoforge.registries.DeferredRegister;
import net.neoforged.neoforge.registries.DeferredBlock;
import net.neoforged.neoforge.registries.DeferredItem;

import java.util.function.Supplier;

@Mod(Mineralia.MOD_ID)
public class Mineralia {
    public static final String MOD_ID = "mineralia";
    public static final DeferredRegister.Blocks BLOCKS = DeferredRegister.createBlocks(MOD_ID);
    public static final DeferredRegister.Items ITEMS = DeferredRegister.createItems(MOD_ID);

    public static final DeferredBlock<Block> TIN_ORE = ore("tin_ore", 3.0f);
    public static final DeferredBlock<Block> DEEPSLATE_TIN_ORE = ore("deepslate_tin_ore", 4.5f);
    public static final DeferredBlock<Block> SILVER_ORE = ore("silver_ore", 3.0f);
    public static final DeferredBlock<Block> DEEPSLATE_SILVER_ORE = ore("deepslate_silver_ore", 4.5f);
    public static final DeferredBlock<Block> RUBY_ORE = ore("ruby_ore", 3.0f);
    public static final DeferredBlock<Block> DEEPSLATE_RUBY_ORE = ore("deepslate_ruby_ore", 4.5f);
    public static final DeferredBlock<Block> SAPPHIRE_ORE = ore("sapphire_ore", 3.0f);
    public static final DeferredBlock<Block> DEEPSLATE_SAPPHIRE_ORE = ore("deepslate_sapphire_ore", 4.5f);

    public static final DeferredBlock<Block> TIN_BLOCK = storage("tin_block");
    public static final DeferredBlock<Block> SILVER_BLOCK = storage("silver_block");
    public static final DeferredBlock<Block> RAW_TIN_BLOCK = storage("raw_tin_block");
    public static final DeferredBlock<Block> RAW_SILVER_BLOCK = storage("raw_silver_block");

    public static final DeferredItem<Item> RAW_TIN = item("raw_tin");
    public static final DeferredItem<Item> TIN_INGOT = item("tin_ingot");
    public static final DeferredItem<Item> RAW_SILVER = item("raw_silver");
    public static final DeferredItem<Item> SILVER_INGOT = item("silver_ingot");
    public static final DeferredItem<Item> RUBY = item("ruby");
    public static final DeferredItem<Item> SAPPHIRE = item("sapphire");

    private static DeferredBlock<Block> ore(String name, float hardness) {
        return BLOCKS.register(name, () -> new DropExperienceBlock(UniformInt.of(2, 5),
                BlockBehaviour.Properties.of().strength(hardness).requiresCorrectToolForDrops()));
    }

    private static DeferredBlock<Block> storage(String name) {
        return BLOCKS.register(name, () -> new Block(BlockBehaviour.Properties.of().strength(5.0f, 6.0f).requiresCorrectToolForDrops()));
    }

    private static DeferredItem<Item> item(String name) {
        return ITEMS.registerSimpleItem(name, new Item.Properties());
    }

    static {
        registerBlockItem(TIN_ORE); registerBlockItem(DEEPSLATE_TIN_ORE);
        registerBlockItem(SILVER_ORE); registerBlockItem(DEEPSLATE_SILVER_ORE);
        registerBlockItem(RUBY_ORE); registerBlockItem(DEEPSLATE_RUBY_ORE);
        registerBlockItem(SAPPHIRE_ORE); registerBlockItem(DEEPSLATE_SAPPHIRE_ORE);
        registerBlockItem(TIN_BLOCK); registerBlockItem(SILVER_BLOCK);
        registerBlockItem(RAW_TIN_BLOCK); registerBlockItem(RAW_SILVER_BLOCK);
    }

    private static void registerBlockItem(DeferredBlock<Block> block) {
        ITEMS.register(block.getId().getPath(), () -> new BlockItem(block.get(), new Item.Properties()));
    }

    public Mineralia(IEventBus modBus) {
        BLOCKS.register(modBus);
        ITEMS.register(modBus);
    }
}
