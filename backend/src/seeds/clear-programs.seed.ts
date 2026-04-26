import { DataSource } from 'typeorm';
import { Program } from '../entities/program.entity';

export async function clearPrograms(dataSource: DataSource): Promise<void> {
  if (!dataSource.isInitialized) {
    console.error('❌ [Clear] Database not initialized');
    return;
  }

  const programRepository = dataSource.getRepository(Program);
  
  try {
    const existingCount = await programRepository.count();
    
    if (existingCount === 0) {
      console.log('ℹ️  [Clear] Programs table is already empty');
      return;
    }
    
    console.log(`⚠️  [Clear] Deleting ${existingCount} programs from database...`);
    await programRepository.delete({});
    
    const finalCount = await programRepository.count();
    console.log(`✅ [Clear] All programs cleared! Final count: ${finalCount}`);
    
  } catch (error) {
    console.error('❌ [Clear] Failed to clear programs:', error);
  }
}
